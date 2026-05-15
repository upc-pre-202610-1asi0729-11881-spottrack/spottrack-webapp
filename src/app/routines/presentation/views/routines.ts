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

export type MachineStatus = 'available' | 'inUse' | 'maintenance';
export type Level = 'beginner' | 'intermediate' | 'advanced';
export type FilterGroup = 'all' | 'chest' | 'legs' | 'back' | 'shoulders' | 'arms';

export interface Alternative {
  nameKey: string;
  free: boolean;
}

export interface Routine {
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
  selector: 'app-routines',
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
  ],
  templateUrl: './routines.html',
  styleUrl: './routines.css',
})
export class RoutinesComponent {
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslateService);

  searchQuery = signal('');
  activeFilter = signal<FilterGroup>('all');
  showModal = signal(false);

  routineName = '';
  selectedObjective: string | null = null;
  selectedLevel: Level = 'intermediate';
  routineNotes = '';

  objectives = ['gainStrength', 'muscleHypertrophy', 'endurance', 'weightLoss', 'generalFitness'];
  levels: Level[] = ['beginner', 'intermediate', 'advanced'];

  filters: FilterGroup[] = ['all', 'chest', 'legs', 'back', 'shoulders', 'arms'];

  routines = signal<Routine[]>([
    {
      id: '1',
      exerciseKey: 'pressDePecho',
      machineKey: 'bancoPechoPlano',
      tagKey: 'chest',
      filterGroup: 'chest',
      level: 'intermediate',
      machineStatus: 'available',
    },
    {
      id: '2',
      exerciseKey: 'sentadillaConBarra',
      machineKey: 'rackSentadilla2',
      tagKey: 'legs',
      filterGroup: 'legs',
      level: 'advanced',
      machineStatus: 'inUse',
      alternatives: [
        { nameKey: 'prensaDePiernas', free: true },
        { nameKey: 'hackSquat', free: true },
        { nameKey: 'sentadillaGoblet', free: true },
      ],
    },
    {
      id: '3',
      exerciseKey: 'pesoMuertoRumano',
      machineKey: 'plataformaPesoMuerto',
      tagKey: 'lowerBack',
      filterGroup: 'back',
      level: 'advanced',
      machineStatus: 'available',
    },
    {
      id: '4',
      exerciseKey: 'dominadas',
      machineKey: 'barraDeDominadas',
      tagKey: 'back',
      filterGroup: 'back',
      level: 'intermediate',
      machineStatus: 'maintenance',
      alternatives: [
        { nameKey: 'poleaAlta', free: true },
        { nameKey: 'remoConBarra', free: true },
        { nameKey: 'maquinaDeRemo', free: true },
      ],
    },
    {
      id: '5',
      exerciseKey: 'pressMilitar',
      machineKey: 'rackDeFuerza',
      tagKey: 'shoulders',
      filterGroup: 'shoulders',
      level: 'intermediate',
      machineStatus: 'available',
    },
  ]);

  filteredRoutines = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const filter = this.activeFilter();
    return this.routines().filter(r => {
      const matchesFilter = filter === 'all' || r.filterGroup === filter;
      const matchesSearch =
        !query ||
        r.exerciseKey.toLowerCase().includes(query) ||
        r.machineKey.toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
  });

  setFilter(filter: FilterGroup): void {
    this.activeFilter.set(filter);
  }

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  getStatusDotColor(status: MachineStatus): string {
    return { available: '#4caf50', inUse: '#f44336', maintenance: '#888888' }[status];
  }

  hasAlternatives(routine: Routine): boolean {
    return !!routine.alternatives?.length;
  }

  openModal(): void {
    this.routineName = '';
    this.selectedObjective = null;
    this.selectedLevel = 'intermediate';
    this.routineNotes = '';
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  createRoutine(): void {
    if (!this.routineName.trim() || !this.selectedObjective) return;
    const name = this.routineName.trim();
    this.closeModal();
    const msg = this.translate.instant('routines.modal.successMessage', { name });
    this.snackBar.open(msg, '✓', {
      duration: 3500,
      panelClass: ['routine-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}
