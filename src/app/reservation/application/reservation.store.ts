import { computed, inject, Injectable, signal } from '@angular/core';
import { AuthStore } from '../../auth/application/auth.store';
import { EquipmentStore } from '../../gym/application/equipment.store';
import { GymStateService, GymMachine } from '../../shared/application/gym-state.service';
import { ReservationApi } from '../infrastructure/reservation-api';
import { ReservationResource } from '../infrastructure/reservation-response';

interface TrackedReservation {
  reservationId:   string;
  machineId:       string;
  equipmentId:     string;
  durationMinutes: number;
  timerStarted:    boolean;
}

@Injectable({ providedIn: 'root' })
export class ReservationStore {

  private readonly api            = inject(ReservationApi);
  private readonly auth           = inject(AuthStore);
  private readonly gymState       = inject(GymStateService);
  private readonly equipmentStore = inject(EquipmentStore);

  private readonly tracked           = signal<Map<string, TrackedReservation>>(new Map());
  private readonly historySignal     = signal<ReservationResource[]>([]);
  private readonly histLoadingSignal = signal(false);
  private readonly errorSignal       = signal<string | null>(null);
  private readonly creatingSignal    = signal(false);
  private readonly nowMs             = signal(Date.now());

  readonly activeReservations  = computed(() => this.historySignal().filter(r => r.status === 'ACTIVE'));
  readonly availableMachines   = this.gymState.availableMachines;
  readonly expiredReservations = this.gymState.expiredReservations;
  readonly history             = this.historySignal.asReadonly();
  readonly historyLoading      = this.histLoadingSignal.asReadonly();
  readonly reservationError    = this.errorSignal.asReadonly();
  readonly creating            = this.creatingSignal.asReadonly();

  constructor() {
    setInterval(() => this.nowMs.set(Date.now()), 1000);
  }

  timeRemainingSeconds(timerExpiry: string | null | undefined): number {
    if (!timerExpiry) return 0;
    const remaining = new Date(timerExpiry).getTime() - this.nowMs();
    return Math.max(0, Math.floor(remaining / 1000));
  }

  loadHistory(): void {
    this.histLoadingSignal.set(true);
    this.api.getAllReservations().subscribe({
      next: all => {
        this.historySignal.set(all);
        this.histLoadingSignal.set(false);
      },
      error: () => this.histLoadingSignal.set(false),
    });
  }

  createReservation(machineId: string, durationSeconds: number): void {
    const durationMinutes = Math.max(1, Math.ceil(durationSeconds / 60));

    this.creatingSignal.set(true);
    this.errorSignal.set(null);

    const clientId   = this.auth.currentUser()?.id ?? 0;
    const now        = new Date();
    const endDate    = new Date(now.getTime() + durationSeconds * 1000);
    const activation = new Date(now.getTime() + 5 * 60 * 1000);

    const pad          = (n: number) => String(n).padStart(2, '0');
    const toTimeString = (d: Date)   =>
      `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

    this.api.initiateExpressReservation({
      clientId,
      equipmentId: machineId,
      startTime:   toTimeString(now),
      endTime:     toTimeString(endDate),
      startedAt:   now.toISOString(),
      timeExpiry:  activation.toISOString(),
    }).subscribe({
      next: res => {
        this.gymState.createReservation(machineId, durationSeconds);
        this.tracked.update(map => {
          const next = new Map(map);
          next.set(machineId, {
            reservationId:   res.id,
            machineId,
            equipmentId:     machineId,
            durationMinutes,
            timerStarted:    false,
          });
          return next;
        });
        this.creatingSignal.set(false);
        this.loadHistory();
      },
      error: (err) => {
        const serverMsg: string = err?.error?.message ?? '';
        const isConflict = serverMsg.toLowerCase().includes('active reservation');
        this.errorSignal.set(
          isConflict ? 'reservation.error.alreadyActive' : 'reservation.error.generic'
        );
        this.creatingSignal.set(false);
      },
    });
  }

  clearError(): void { this.errorSignal.set(null); }

  activateReservation(reservationId: string, startTime: string, endTime: string): void {
    const durationMinutes = this.parseDurationMinutes(startTime, endTime);

    this.api.startTimer(reservationId, durationMinutes).subscribe({
      next: () => {
        const entry = [...this.tracked().values()].find(v => v.reservationId === reservationId);
        if (entry) {
          this.gymState.activateReservation(entry.machineId);
          this.tracked.update(map => {
            const next = new Map(map);
            const cur  = next.get(entry.machineId);
            if (cur) next.set(entry.machineId, { ...cur, timerStarted: true });
            return next;
          });
        }
        this.loadHistory();
      },
      error: () => {},
    });
  }

  cancelReservation(reservationId: string): void {
    const entry = [...this.tracked().values()].find(v => v.reservationId === reservationId);
    if (entry) {
      this.gymState.cancelReservation(entry.machineId);
      this.removeTracked(entry.machineId);
    }

    this.api.cancelReservation(reservationId).subscribe({
      next:  () => this.loadHistory(),
      error: () => this.loadHistory(),
    });
  }

  endReservation(reservationId: string): void {
    const entry = [...this.tracked().values()].find(v => v.reservationId === reservationId);
    if (entry) {
      this.gymState.cancelReservation(entry.machineId);
      this.removeTracked(entry.machineId);
    }

    this.api.endReservation(reservationId).subscribe({
      next:  () => this.loadHistory(),
      error: () => this.loadHistory(),
    });
  }

  dismissExpired(machineId: string): void {
    this.gymState.dismissExpiredReservation(machineId);
    this.removeTracked(machineId);
  }

  formatTimer(seconds: number):    string  { return this.gymState.formatTimer(seconds); }
  getZoneKey(category: string):    string  { return this.gymState.getZoneKey(category); }
  isExpired(machine: GymMachine):  boolean { return machine.timerSeconds === 0; }

  getEquipmentName(equipmentId: string): string {
    const byUuid = this.equipmentStore.equipment().find(e => e.uuid === equipmentId);
    if (byUuid) return byUuid.name;
    const byLocalId = this.gymState.machines().find(m => m.id === equipmentId);
    if (byLocalId) return byLocalId.nameKey;
    return equipmentId.length > 12 ? equipmentId.slice(0, 8) + '…' : equipmentId;
  }

  private parseDurationMinutes(startTime: string, endTime: string): number {
    const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    let diff = toMin(endTime) - toMin(startTime);
    if (diff <= 0) diff += 24 * 60;
    return Math.max(1, diff);
  }

  private removeTracked(machineId: string): void {
    this.tracked.update(map => {
      const next = new Map(map);
      next.delete(machineId);
      return next;
    });
  }
}
