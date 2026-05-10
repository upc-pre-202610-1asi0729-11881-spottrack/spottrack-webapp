import { Component, Input, OnInit, OnDestroy } from '@angular/core';
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
  name: string;
  status: MachineStatus;
  category: MachineCategory;
  top: string;
  left: string;
  icon: string;
  timerSeconds?: number; // remaining seconds if IN_USE
}

export interface Gym {
  id: string;
  name: string;
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
  activeFilter: FilterTab = 'ALL';

  gyms: Gym[] = [
    { id: 'gym1', name: 'Gimnasio Centro' },
    { id: 'gym2', name: 'Gimnasio Norte' },
    { id: 'gym3', name: 'Gimnasio Sur' },
  ];

  allMachines: MachineMarker[] = [
    {
      id: '1',
      name: 'Cinta 1',
      status: 'AVAILABLE',
      category: 'CARDIO',
      top: '22%',
      left: '18%',
      icon: 'directions_run',
    },
    {
      id: '2',
      name: 'Prensa',
      status: 'AVAILABLE',
      category: 'STRENGTH',
      top: '22%',
      left: '48%',
      icon: 'fitness_center',
    },
    {
      id: '3',
      name: 'Polea Alta',
      status: 'AVAILABLE',
      category: 'STRENGTH',
      top: '22%',
      left: '76%',
      icon: 'fitness_center',
    },
    {
      id: '4',
      name: 'Cinta 2',
      status: 'AVAILABLE',
      category: 'CARDIO',
      top: '48%',
      left: '18%',
      icon: 'directions_run',
    },
    {
      id: '5',
      name: 'Raquetmáquina',
      status: 'RESERVED',
      category: 'STRENGTH',
      top: '48%',
      left: '48%',
      icon: 'sports_tennis',
      timerSeconds: 599,
    },
    {
      id: '6',
      name: 'Remo',
      status: 'IN_USE',
      category: 'CARDIO',
      top: '48%',
      left: '76%',
      icon: 'rowing',
    },
    {
      id: '7',
      name: 'Elíptica',
      status: 'IN_USE',
      category: 'CARDIO',
      top: '72%',
      left: '18%',
      icon: 'directions_bike',
    },
    {
      id: '8',
      name: 'Banco Pecho',
      status: 'IN_USE',
      category: 'STRENGTH',
      top: '72%',
      left: '48%',
      icon: 'fitness_center',
    },
  ];

  private timerInterval: any;

  get filteredMachines(): MachineMarker[] {
    if (this.activeFilter === 'ALL') return this.allMachines;
    if (this.activeFilter === 'STRENGTH')
      return this.allMachines.filter((m) => m.category === 'STRENGTH');
    return this.allMachines.filter((m) => m.category === 'CARDIO');
  }

  get availableCount(): number {
    return this.allMachines.filter((m) => m.status === 'AVAILABLE').length;
  }
  get inUseCount(): number {
    return this.allMachines.filter((m) => m.status === 'IN_USE').length;
  }
  get reservedCount(): number {
    return this.allMachines.filter((m) => m.status === 'RESERVED').length;
  }

  ngOnInit(): void {
    // Tick timers every second for IN_USE machines
    this.timerInterval = setInterval(() => {
      this.allMachines.forEach((m) => {
        if (m.timerSeconds !== undefined && m.timerSeconds > 0) {
          m.timerSeconds--;
        }
      });
    }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.timerInterval);
  }

  setFilter(filter: FilterTab): void {
    this.activeFilter = filter;
  }

  formatTimer(seconds: number): string {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
}
