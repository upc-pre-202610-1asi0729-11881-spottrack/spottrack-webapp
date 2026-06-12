import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RoutinesStore, FilterGroup } from '../../../application/routines.store';
import { ContextMenuDirective } from '../../../../shared/presentation/directives/context-menu.directive';
import { ContextMenuItem } from '../../../../shared/application/context-menu.service';

// Keep local types for UI-level concerns the store does not own
export type MachineStatus = 'available' | 'inUse' | 'maintenance';
export type Level = 'beginner' | 'intermediate' | 'advanced';
export interface Alternative { nameKey: string; free: boolean; }
export interface RoutineCard {
  id: string;
  exerciseKey: string;
  machineKey: string;
  tagKey: string;
  filterGroup: Exclude<FilterGroup, 'all'>;
  level: Level;
  machineStatus: MachineStatus;
  alternatives?: Alternative[];
}

@Component({
  selector: 'app-routine-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    TranslateModule,
    ContextMenuDirective,
  ],
  templateUrl: './routine-list.component.html',
  styleUrl: './routine-list.component.css',
})
export class RoutineListComponent {
  private snackBar  = inject(MatSnackBar);
  private translate = inject(TranslateService);
  readonly store    = inject(RoutinesStore);

  readonly searchQuery  = this.store.searchQuery;
  readonly activeFilter = this.store.activeFilter;

  showModal = signal(false);

  routineName = '';
  selectedObjective: string | null = null;
  selectedLevel: Level = 'intermediate';
  routineNotes = '';

  objectives = ['gainStrength', 'muscleHypertrophy', 'endurance', 'weightLoss', 'generalFitness'];
  levels: Level[] = ['beginner', 'intermediate', 'advanced'];
  filters: FilterGroup[] = ['all', 'chest', 'legs', 'back', 'shoulders', 'arms'];

  // Local mock cards until the API is wired
  routineCards = signal<RoutineCard[]>([
    { id: '1', exerciseKey: 'pressDePecho', machineKey: 'bancoPechoPlano', tagKey: 'chest', filterGroup: 'chest', level: 'intermediate', machineStatus: 'available' },
    { id: '2', exerciseKey: 'sentadillaConBarra', machineKey: 'rackSentadilla2', tagKey: 'legs', filterGroup: 'legs', level: 'advanced', machineStatus: 'inUse', alternatives: [{ nameKey: 'prensaDePiernas', free: true }, { nameKey: 'hackSquat', free: true }] },
    { id: '3', exerciseKey: 'pesoMuertoRumano', machineKey: 'plataformaPesoMuerto', tagKey: 'lowerBack', filterGroup: 'back', level: 'advanced', machineStatus: 'available' },
    { id: '4', exerciseKey: 'dominadas', machineKey: 'barraDeDominadas', tagKey: 'back', filterGroup: 'back', level: 'intermediate', machineStatus: 'maintenance', alternatives: [{ nameKey: 'poleaAlta', free: true }, { nameKey: 'remoConBarra', free: true }] },
    { id: '5', exerciseKey: 'pressMilitar', machineKey: 'rackDeFuerza', tagKey: 'shoulders', filterGroup: 'shoulders', level: 'intermediate', machineStatus: 'available' },
  ]);

  filteredRoutines = computed(() => {
    const query  = this.searchQuery().toLowerCase();
    const filter = this.activeFilter();
    return this.routineCards().filter(r => {
      const matchesFilter = filter === 'all' || r.filterGroup === filter;
      const matchesSearch = !query || r.exerciseKey.toLowerCase().includes(query) || r.machineKey.toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
  });

  setFilter(filter: FilterGroup): void { this.activeFilter.set(filter); }
  onSearch(event: Event): void { this.searchQuery.set((event.target as HTMLInputElement).value); }
  getStatusDotColor(status: MachineStatus): string {
    return { available: '#4caf50', inUse: '#f44336', maintenance: '#888888' }[status];
  }
  hasAlternatives(r: RoutineCard): boolean { return !!r.alternatives?.length; }

  openModal(): void { this.routineName = ''; this.selectedObjective = null; this.selectedLevel = 'intermediate'; this.routineNotes = ''; this.showModal.set(true); }
  closeModal(): void { this.showModal.set(false); }

  routineMenu(r: RoutineCard): ContextMenuItem[] {
    return [
      { label: 'New routine',       icon: 'add',          action: () => this.openModal() },
      { label: '', icon: '', separator: true, action: () => {} },
      { label: 'Copy exercise name',icon: 'content_copy', action: () => navigator.clipboard.writeText(r.exerciseKey) },
    ];
  }

  createRoutine(): void {
    if (!this.routineName.trim() || !this.selectedObjective) return;
    const name = this.routineName.trim();
    this.closeModal();
    this.snackBar.open(this.translate.instant('routines.modal.successMessage', { name }), '✓', {
      duration: 3500, panelClass: ['routine-snackbar'], horizontalPosition: 'center', verticalPosition: 'top',
    });
  }
}
