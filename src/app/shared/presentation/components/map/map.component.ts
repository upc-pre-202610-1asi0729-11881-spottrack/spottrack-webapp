import { Component, signal, computed, inject, effect, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { GymStateService, GymMachine } from '../../../application/gym-state.service';
import { ReservationStore } from '../../../../reservation/application/reservation.store';
import { EquipmentStore } from '../../../../gym/application/equipment.store';

export type { MachineStatus, MachineCategory, GymMachine as MachineMarker } from '../../../application/gym-state.service';
export type FilterTab = 'ALL' | 'STRENGTH' | 'CARDIO';
export type ViewMode  = 'MAP' | 'HEATMAP' | 'ALL_GYMS';
export interface Gym { id: string; }

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [
    CommonModule, MatIconModule, MatButtonModule, MatCardModule,
    MatSelectModule, MatChipsModule, MatBadgeModule, TranslateModule, FormsModule,
  ],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css',
})
export class MapComponent {

  @ViewChild('heatCanvas') private heatCanvasRef?: ElementRef<HTMLCanvasElement>;

  private readonly gymState         = inject(GymStateService);
  private readonly reservationStore = inject(ReservationStore);
  private readonly equipmentStore   = inject(EquipmentStore);
  private readonly snackBar         = inject(MatSnackBar);
  private readonly translate        = inject(TranslateService);

  readonly selectedGymId        = signal('gym1');
  readonly viewMode             = signal<ViewMode>('MAP');
  readonly activeFilter         = signal<FilterTab>('ALL');
  readonly selectedMachineId    = signal<string | null>(null);
  readonly showAlternativesPanel = signal(false);
  readonly allMachines          = this.gymState.machines;

  readonly selectedMachine = computed(() => {
    const id = this.selectedMachineId();
    return id ? (this.gymState.machines().find(m => m.id === id) ?? null) : null;
  });

  readonly alternativeMachines = computed(() => {
    const sel = this.selectedMachine();
    if (!sel) return [];
    return this.gymState.machines().filter(
      m => m.status === 'AVAILABLE' && m.id !== sel.id && m.category === sel.category
    );
  });

  readonly gyms: Gym[] = [{ id: 'gym1' }, { id: 'gym2' }, { id: 'gym3' }];

  private readonly gymMockUsage: Record<string, Record<string, number>> = {
    gym2: { '1': 45, '2': 12, '3': 78, '4': 30, '5': 90, '6': 25, '7': 60, '8': 15, '9': 40 },
    gym3: { '1': 80, '2': 60, '3': 20, '4': 70, '5': 10, '6': 85, '7': 35, '8': 50, '9': 65 },
  };

  private readonly gymMockStats: Record<string, { inUse: number; available: number }> = {
    gym2: { inUse: 4, available: 5 },
    gym3: { inUse: 6, available: 3 },
  };

  private readonly usageByMachineId = computed((): Record<string, number> => {
    const history   = this.reservationStore.history();
    const equipment = this.equipmentStore.equipment();
    const counts: Record<string, number> = {};
    for (const r of history) {
      const eq = equipment.find(e => e.uuid === r.equipmentId);
      if (eq) {
        const mid = String(eq.id);
        counts[mid] = (counts[mid] ?? 0) + 1;
      }
    }
    return counts;
  });

  readonly currentGymUsage = computed((): Record<string, number> => {
    const gymId = this.selectedGymId();
    return gymId === 'gym1' ? this.usageByMachineId() : (this.gymMockUsage[gymId] ?? {});
  });

  readonly allGymsUsage = computed((): Record<string, Record<string, number>> => ({
    gym1: this.usageByMachineId(),
    gym2: this.gymMockUsage['gym2'] ?? {},
    gym3: this.gymMockUsage['gym3'] ?? {},
  }));

  constructor() {
    effect(() => {
      const err = this.reservationStore.reservationError();
      if (!err) return;
      this.snackBar.open(this.translate.instant(err), '✕', {
        duration: 5000, panelClass: ['error-snackbar'],
        horizontalPosition: 'center', verticalPosition: 'top',
      });
      this.reservationStore.clearError();
    });

    effect(() => {
      const _u = this.currentGymUsage();
      const _m = this.viewMode();
      setTimeout(() => this.drawMainHeatmap(), 80);
    });
  }

  // ── Getters ──────────────────────────────────────────────────────────────

  get filteredMachines(): GymMachine[] {
    const f = this.activeFilter(), all = this.gymState.machines();
    if (f === 'STRENGTH') return all.filter(m => m.category === 'STRENGTH');
    if (f === 'CARDIO')   return all.filter(m => m.category === 'CARDIO');
    return all;
  }

  get availableCount(): number { return this.gymState.machines().filter(m => m.status === 'AVAILABLE').length; }
  get inUseCount():    number  { return this.gymState.machines().filter(m => m.status === 'IN_USE').length; }
  get reservedCount(): number  { return this.gymState.machines().filter(m => m.status === 'RESERVED').length; }
  get utilization():   number  { return Math.round(((9 - this.availableCount) / 9) * 100); }

  // ── Actions ──────────────────────────────────────────────────────────────

  setFilter(f: FilterTab): void { this.activeFilter.set(f); }

  openMachineDetail(machine: GymMachine, event: Event): void {
    event.stopPropagation();
    this.selectedMachineId.set(machine.id);
    this.showAlternativesPanel.set(false);
  }

  closeMachineDetail(): void { this.selectedMachineId.set(null); this.showAlternativesPanel.set(false); }
  openAlternatives():   void { this.showAlternativesPanel.set(true); }

  selectGym(gymId: string): void {
    this.selectedGymId.set(gymId);
    this.viewMode.set('MAP');
  }

  reserveMachine(): void {
    const m = this.selectedMachine();
    if (!m) return;
    this.closeMachineDetail();
    this.reservationStore.createReservation(m.id, 15 * 60);
  }

  formatTimer(s: number): string { return this.gymState.formatTimer(s); }

  // ── Multi-gym helpers ────────────────────────────────────────────────────

  gymAvailable(gymId: string): number {
    return gymId === 'gym1' ? this.availableCount : (this.gymMockStats[gymId]?.available ?? 5);
  }

  gymInUse(gymId: string): number {
    return gymId === 'gym1' ? this.inUseCount : (this.gymMockStats[gymId]?.inUse ?? 3);
  }

  gymUtilization(gymId: string): number {
    return Math.round((this.gymInUse(gymId) / 9) * 100);
  }

  gymTopMachineKey(gymId: string): string {
    const usage   = this.allGymsUsage()[gymId] ?? {};
    const entries = Object.entries(usage);
    if (!entries.length) return '';
    const [topId] = entries.sort(([, a], [, b]) => b - a)[0];
    return this.gymState.machines().find(m => m.id === topId)?.nameKey ?? '';
  }

  // ── Heatmap CSS helpers (for mini-maps) ─────────────────────────────────

  getHeatColor(gymId: string, machineId: string): string {
    const usage = this.allGymsUsage()[gymId] ?? {};
    const vals  = Object.values(usage);
    const max   = Math.max(1, ...vals);
    const [r, g, b] = this.rgbFromIntensity((usage[machineId] ?? 0) / max);
    return `rgb(${r},${g},${b})`;
  }

  getHeatOpacity(gymId: string, machineId: string): number {
    const usage = this.allGymsUsage()[gymId] ?? {};
    const vals  = Object.values(usage);
    const max   = Math.max(1, ...vals);
    return (usage[machineId] ?? 0) / max;
  }

  // ── Canvas heatmap drawing ────────────────────────────────────────────────

  private drawMainHeatmap(): void {
    if (this.viewMode() !== 'HEATMAP') return;
    const canvas = this.heatCanvasRef?.nativeElement;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const W = parent.offsetWidth;
    const H = parent.offsetHeight;
    if (!W || !H) return;

    canvas.width  = W;
    canvas.height = H;

    const ctx      = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, W, H);

    const machines = this.gymState.machines();
    const usage    = this.currentGymUsage();
    const maxUsage = Math.max(1, ...machines.map(m => usage[m.id] ?? 0));

    const sorted = [...machines].sort((a, b) => (usage[a.id] ?? 0) - (usage[b.id] ?? 0));

    for (const machine of sorted) {
      const val       = usage[machine.id] ?? 0;
      const intensity = val / maxUsage;
      const x         = (parseFloat(machine.left) / 100) * W;
      const y         = (parseFloat(machine.top)  / 100) * H;
      const radius    = 85 + intensity * 65;
      const [r, g, b] = this.rgbFromIntensity(intensity);
      const alpha     = intensity > 0 ? 0.14 + intensity * 0.46 : 0.07;

      const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
      grad.addColorStop(0,   `rgba(${r},${g},${b},${alpha})`);
      grad.addColorStop(0.5, `rgba(${r},${g},${b},${alpha * 0.35})`);
      grad.addColorStop(1,   `rgba(0,0,0,0)`);

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    }
  }

  private rgbFromIntensity(t: number): [number, number, number] {
    if (t <= 0)   return [30, 80, 200];
    if (t < 0.25) { return [0, Math.round(t * 4 * 150), 255]; }
    if (t < 0.5)  { const s = (t - 0.25) * 4; return [0, 150 + Math.round(s * 105), Math.round(255 * (1 - s))]; }
    if (t < 0.75) { const s = (t - 0.5)  * 4; return [Math.round(s * 255), 255, 0]; }
    const s = (t - 0.75) * 4; return [255, Math.round(255 * (1 - s)), 0];
  }

  private notify(key: string): void {
    this.snackBar.open(this.translate.instant(key), '✓', {
      duration: 3500, panelClass: ['routine-snackbar'],
      horizontalPosition: 'center', verticalPosition: 'top',
    });
  }

  notifyWhenFree():   void { this.notify('map.detail.notifications.notified'); }
  reportAsFree():     void { this.notify('map.detail.notifications.reportedFree'); }
  reportAsOccupied(): void { this.notify('map.detail.notifications.reportedOccupied'); }
}
