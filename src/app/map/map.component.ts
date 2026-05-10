import { Component, Input, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';

export type MachineStatus = 'AVAILABLE' | 'IN_USE' | 'RESERVED';
export type MachineCategory = 'CARDIO' | 'STRENGTH';

export interface MachineMarker {
  id: string;
  nameKey: string;
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

  selectedGymId = 'gym1';

  // Signals — updates inside setInterval are tracked by Angular 21's scheduler
  activeFilter = signal<FilterTab>('ALL');

  allMachines = signal<MachineMarker[]>([
    { id: '1', nameKey: 'cinta1',        status: 'AVAILABLE', category: 'CARDIO',   top: '22%', left: '18%', icon: 'directions_run' },
    { id: '2', nameKey: 'prensa',        status: 'AVAILABLE', category: 'STRENGTH', top: '22%', left: '48%', icon: 'fitness_center' },
    { id: '3', nameKey: 'poleaAlta',     status: 'AVAILABLE', category: 'STRENGTH', top: '22%', left: '76%', icon: 'fitness_center' },
    { id: '4', nameKey: 'cinta2',        status: 'AVAILABLE', category: 'CARDIO',   top: '48%', left: '18%', icon: 'directions_run' },
    { id: '5', nameKey: 'raquetmaquina', status: 'RESERVED',  category: 'STRENGTH', top: '48%', left: '48%', icon: 'sports_tennis', timerSeconds: 599 },
    { id: '6', nameKey: 'remo',          status: 'IN_USE',    category: 'CARDIO',   top: '48%', left: '76%', icon: 'rowing' },
    { id: '7', nameKey: 'eliptica',      status: 'IN_USE',    category: 'CARDIO',   top: '72%', left: '18%', icon: 'directions_bike' },
    { id: '8', nameKey: 'bancoPecho',    status: 'IN_USE',    category: 'STRENGTH', top: '72%', left: '48%', icon: 'fitness_center' },
  ]);

  gyms: Gym[] = [{ id: 'gym1' }, { id: 'gym2' }, { id: 'gym3' }];

  private timerInterval: any;

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
}
