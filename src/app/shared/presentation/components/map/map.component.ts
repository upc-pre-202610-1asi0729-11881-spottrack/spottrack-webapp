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
import { EquipmentStatus } from '../../../../gym/domain/model/equipment.entity';

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

  // Historical reservation counts — used only for ghost-pin numbers in HEATMAP mode
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

  // Live [0–1] intensity from equipment API status — drives heatmap canvas colors
  private readonly liveIntensityByMachineId = computed((): Record<string, number> => {
    const equipment = this.equipmentStore.equipment();
    const activeRes = this.reservationStore.activeReservations();
    const pendingUuids = new Set(activeRes.filter(r => !r.timerExpiry).map(r => r.equipmentId));
    const result: Record<string, number> = {};
    for (const eq of equipment) {
      const mid = String(eq.id);
      switch (eq.status) {
        case EquipmentStatus.IN_USE:          result[mid] = 1.0;  break;
        case EquipmentStatus.OUT_OF_SERVICE:  result[mid] = 0.55; break;
        case EquipmentStatus.MAINTENANCE:     result[mid] = 0.45; break;
        default: // AVAILABLE
          result[mid] = pendingUuids.has(eq.uuid) ? 0.65 : 0.0;
      }
    }
    return result;
  });

  // Intensity per gym for heatmap canvas (gym1 = live, gym2/3 = normalised mock)
  readonly currentGymIntensity = computed((): Record<string, number> => {
    const gymId = this.selectedGymId();
    if (gymId === 'gym1') return this.liveIntensityByMachineId();
    const mock = this.gymMockUsage[gymId] ?? {};
    const max  = Math.max(1, ...Object.values(mock));
    return Object.fromEntries(Object.entries(mock).map(([k, v]) => [k, v / max]));
  });

  // Historical usage counts used by ghost-pin chip numbers
  readonly currentGymUsage = computed((): Record<string, number> => {
    const gymId = this.selectedGymId();
    return gymId === 'gym1' ? this.usageByMachineId() : (this.gymMockUsage[gymId] ?? {});
  });

  // Per-gym intensity for mini-heatmaps in ALL_GYMS view
  private readonly allGymsIntensity = computed((): Record<string, Record<string, number>> => {
    const gym1 = this.liveIntensityByMachineId();
    const toNormalised = (gymId: string): Record<string, number> => {
      const mock = this.gymMockUsage[gymId] ?? {};
      const max  = Math.max(1, ...Object.values(mock));
      return Object.fromEntries(Object.entries(mock).map(([k, v]) => [k, v / max]));
    };
    return { gym1, gym2: toNormalised('gym2'), gym3: toNormalised('gym3') };
  });

  // Keep for gymTopMachineKey (historical popularity rank)
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
      const _i = this.currentGymIntensity();
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

  get availableCount(): number {
    const eq = this.equipmentStore.equipment();
    return eq.length
      ? eq.filter(e => e.status === EquipmentStatus.AVAILABLE).length
      : this.gymState.machines().filter(m => m.status === 'AVAILABLE').length;
  }
  get inUseCount(): number {
    const eq = this.equipmentStore.equipment();
    return eq.length
      ? eq.filter(e => e.status === EquipmentStatus.IN_USE).length
      : this.gymState.machines().filter(m => m.status === 'IN_USE').length;
  }
  get reservedCount(): number {
    return this.reservationStore.activeReservations().filter(r => !r.timerExpiry).length;
  }
  get utilization(): number {
    const eq    = this.equipmentStore.equipment();
    const total = eq.length || this.gymState.machines().length || 1;
    return Math.round(((total - this.availableCount) / total) * 100);
  }

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
    if (gymId === 'gym1') return this.utilization;
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
    const t = this.allGymsIntensity()[gymId]?.[machineId] ?? 0;
    const [r, g, b] = this.rgbFromIntensity(t);
    return `rgb(${r},${g},${b})`;
  }

  getHeatOpacity(gymId: string, machineId: string): number {
    return this.allGymsIntensity()[gymId]?.[machineId] ?? 0;
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

    const machines  = this.gymState.machines();
    const intensity = this.currentGymIntensity();

    const sorted = [...machines].sort((a, b) => (intensity[a.id] ?? 0) - (intensity[b.id] ?? 0));

    for (const machine of sorted) {
      const t         = intensity[machine.id] ?? 0;
      const x         = (parseFloat(machine.left) / 100) * W;
      const y         = (parseFloat(machine.top)  / 100) * H;
      const radius    = 85 + t * 65;
      const [r, g, b] = this.rgbFromIntensity(t);
      const alpha     = t > 0 ? 0.14 + t * 0.46 : 0.07;

      const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
      grad.addColorStop(0,   `rgba(${r},${g},${b},${alpha})`);
      grad.addColorStop(0.5, `rgba(${r},${g},${b},${alpha * 0.35})`);
      grad.addColorStop(1,   'rgba(0,0,0,0)');

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
