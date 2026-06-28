import { inject, Injectable, signal } from '@angular/core';
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

  private readonly api           = inject(ReservationApi);
  private readonly auth          = inject(AuthStore);
  private readonly gymState      = inject(GymStateService);
  private readonly equipmentStore = inject(EquipmentStore);

  private readonly tracked           = signal<Map<string, TrackedReservation>>(new Map());
  private readonly historySignal     = signal<ReservationResource[]>([]);
  private readonly histLoadingSignal = signal(false);

  readonly reservations        = this.gymState.reservedMachines;
  readonly pendingReservations = this.gymState.pendingMachines;
  readonly availableMachines   = this.gymState.availableMachines;
  readonly expiredReservations = this.gymState.expiredReservations;
  readonly history             = this.historySignal.asReadonly();
  readonly historyLoading      = this.histLoadingSignal.asReadonly();

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

    this.gymState.createReservation(machineId, durationSeconds);

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
      },
      error: () => {},
    });
  }

  activateReservation(machineId: string): void {
    this.gymState.activateReservation(machineId);

    const entry = this.tracked().get(machineId);
    if (!entry) return;

    this.api.startTimer(entry.reservationId, entry.durationMinutes).subscribe({
      next: () => {
        this.tracked.update(map => {
          const next = new Map(map);
          const cur  = next.get(machineId);
          if (cur) next.set(machineId, { ...cur, timerStarted: true });
          return next;
        });
      },
      error: () => {},
    });
  }

  cancelReservation(machineId: string): void {
    this.gymState.cancelReservation(machineId);

    const entry = this.tracked().get(machineId);
    if (!entry) return;

    this.api.cancelReservation(entry.reservationId).subscribe({
      next:  () => this.removeTracked(machineId),
      error: () => this.removeTracked(machineId),
    });
  }

  endReservation(machineId: string): void {
    this.gymState.cancelReservation(machineId);

    const entry = this.tracked().get(machineId);
    if (!entry) return;

    this.api.endReservation(entry.reservationId).subscribe({
      next:  () => this.removeTracked(machineId),
      error: () => this.removeTracked(machineId),
    });
  }

  dismissExpired(machineId: string): void {
    this.gymState.dismissExpiredReservation(machineId);
    this.removeTracked(machineId);
  }

  formatTimer(seconds: number): string  { return this.gymState.formatTimer(seconds); }
  getZoneKey(category: string):  string  { return this.gymState.getZoneKey(category); }
  isExpired(machine: GymMachine): boolean { return machine.timerSeconds === 0; }

  getEquipmentName(equipmentId: string): string {
    const byUuid = this.equipmentStore.equipment().find(e => e.uuid === equipmentId);
    if (byUuid) return byUuid.name;
    const byLocalId = this.gymState.machines().find(m => m.id === equipmentId);
    if (byLocalId) return byLocalId.nameKey;
    return equipmentId.length > 12 ? equipmentId.slice(0, 8) + '…' : equipmentId;
  }

  private removeTracked(machineId: string): void {
    this.tracked.update(map => {
      const next = new Map(map);
      next.delete(machineId);
      return next;
    });
  }
}
