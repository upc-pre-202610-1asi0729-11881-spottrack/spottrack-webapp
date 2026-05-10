import { Component, Input, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
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

export type MachineStatus = 'AVAILABLE' | 'IN_USE' | 'RESERVED';
export type MachineCategory = 'CARDIO' | 'STRENGTH';

export interface MachineMarker {
  id: string;
  nameKey: string;
  muscleGroupKey: string;
  status: MachineStatus;
  category: MachineCategory;
  top: string;
  left: string;
  icon: string;
  timerSeconds?: number;
}

export interface Gym {
  id: string;
}

export type FilterTab = 'ALL' | 'STRENGTH' | 'CARDIO';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
    MatChipsModule,
    MatBadgeModule,
    TranslateModule,
    FormsModule,
  ],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css',
})
export class MapComponent implements OnInit, OnDestroy {
  @Input() userName: string = 'Usuario';

  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslateService);

  selectedGymId = 'gym1';
  activeFilter = signal<FilterTab>('ALL');
  selectedMachineId = signal<string | null>(null);
  showAlternativesPanel = signal(false);

  // Derived from allMachines so the popup timer re-renders on every interval tick
  selectedMachine = computed(() => {
    const id = this.selectedMachineId();
    return id ? (this.allMachines().find(m => m.id === id) ?? null) : null;
  });

  allMachines = signal<MachineMarker[]>([
    { id: '1', nameKey: 'cinta1',             muscleGroupKey: 'cardio',  status: 'AVAILABLE', category: 'CARDIO',   top: '22%', left: '18%', icon: 'directions_run' },
    { id: '2', nameKey: 'prensaPiernas',       muscleGroupKey: 'legs',    status: 'AVAILABLE', category: 'STRENGTH', top: '22%', left: '48%', icon: 'fitness_center' },
    { id: '3', nameKey: 'poleaAlta',           muscleGroupKey: 'back',    status: 'AVAILABLE', category: 'STRENGTH', top: '22%', left: '76%', icon: 'fitness_center' },
    { id: '4', nameKey: 'cinta2',              muscleGroupKey: 'cardio',  status: 'AVAILABLE', category: 'CARDIO',   top: '48%', left: '18%', icon: 'directions_run' },
    { id: '5', nameKey: 'rackSentadilla1',     muscleGroupKey: 'legs',    status: 'RESERVED',  category: 'STRENGTH', top: '48%', left: '48%', icon: 'fitness_center', timerSeconds: 599 },
    { id: '6', nameKey: 'remo',                muscleGroupKey: 'back',    status: 'IN_USE',    category: 'CARDIO',   top: '48%', left: '76%', icon: 'rowing' },
    { id: '7', nameKey: 'eliptica',            muscleGroupKey: 'cardio',  status: 'IN_USE',    category: 'CARDIO',   top: '72%', left: '18%', icon: 'directions_bike' },
    { id: '8', nameKey: 'bancoPecho',          muscleGroupKey: 'chest',   status: 'IN_USE',    category: 'STRENGTH', top: '72%', left: '48%', icon: 'fitness_center' },
    { id: '9', nameKey: 'bancoPechoInclinado', muscleGroupKey: 'chest',   status: 'AVAILABLE', category: 'STRENGTH', top: '72%', left: '76%', icon: 'fitness_center' },
  ]);

  gyms: Gym[] = [{ id: 'gym1' }, { id: 'gym2' }, { id: 'gym3' }];

  private timerInterval: any;

  alternativeMachines = computed(() => {
    const selected = this.selectedMachine();
    if (!selected) return [];
    return this.allMachines().filter(
      m => m.status === 'AVAILABLE' && m.id !== selected.id && m.category === selected.category
    );
  });

  get filteredMachines(): MachineMarker[] {
    const f = this.activeFilter();
    const all = this.allMachines();
    if (f === 'ALL')      return all;
    if (f === 'STRENGTH') return all.filter(m => m.category === 'STRENGTH');
    return all.filter(m => m.category === 'CARDIO');
  }

  get availableCount(): number { return this.allMachines().filter(m => m.status === 'AVAILABLE').length; }
  get inUseCount():    number { return this.allMachines().filter(m => m.status === 'IN_USE').length; }
  get reservedCount(): number { return this.allMachines().filter(m => m.status === 'RESERVED').length; }

  ngOnInit(): void {
    this.timerInterval = setInterval(() => {
      this.allMachines.update(machines =>
        machines.map(m => ({
          ...m,
          timerSeconds: m.timerSeconds !== undefined && m.timerSeconds > 0
            ? m.timerSeconds - 1
            : m.timerSeconds,
        }))
      );
    }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.timerInterval);
  }

  setFilter(filter: FilterTab): void {
    this.activeFilter.set(filter);
  }

  formatTimer(seconds: number): string {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  openMachineDetail(machine: MachineMarker, event: Event): void {
    event.stopPropagation();
    this.selectedMachineId.set(machine.id);
    this.showAlternativesPanel.set(false);
  }

  closeMachineDetail(): void {
    this.selectedMachineId.set(null);
    this.showAlternativesPanel.set(false);
  }

  openAlternatives(): void {
    this.showAlternativesPanel.set(true);
  }

  private confirm(key: string): void {
    this.closeMachineDetail();
    this.snackBar.open(this.translate.instant(key), '✓', {
      duration: 3500,
      panelClass: ['routine-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  notifyWhenFree():    void { this.confirm('map.detail.notifications.notified'); }
  reportAsFree():      void { this.confirm('map.detail.notifications.reportedFree'); }
  reserveMachine():    void { this.confirm('map.detail.notifications.reserved'); }
  reportAsOccupied():  void { this.confirm('map.detail.notifications.reportedOccupied'); }
}
