import { Component, signal, computed, inject } from '@angular/core';
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
import { GymStateService, GymMachine } from '../../../shared/application/gym-state.service';

// Re-export for backward compatibility
export type { MachineStatus, MachineCategory, GymMachine as MachineMarker } from '../../../shared/application/gym-state.service';

export type FilterTab = 'ALL' | 'STRENGTH' | 'CARDIO';

export interface Gym {
  id: string;
}

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
  templateUrl: './map.html',
  styleUrl: './map.css',
})
export class MapComponent {
  private gymState = inject(GymStateService);
  private snackBar  = inject(MatSnackBar);
  private translate = inject(TranslateService);

  selectedGymId         = 'gym1';
  activeFilter          = signal<FilterTab>('ALL');
  selectedMachineId     = signal<string | null>(null);
  showAlternativesPanel = signal(false);

  readonly allMachines = this.gymState.machines;

  selectedMachine = computed(() => {
    const id = this.selectedMachineId();
    return id ? (this.gymState.machines().find(m => m.id === id) ?? null) : null;
  });

  alternativeMachines = computed(() => {
    const selected = this.selectedMachine();
    if (!selected) return [];
    return this.gymState.machines().filter(
      m => m.status === 'AVAILABLE' && m.id !== selected.id && m.category === selected.category
    );
  });

  gyms: Gym[] = [{ id: 'gym1' }, { id: 'gym2' }, { id: 'gym3' }];

  get filteredMachines(): GymMachine[] {
    const f   = this.activeFilter();
    const all = this.gymState.machines();
    if (f === 'ALL')      return all;
    if (f === 'STRENGTH') return all.filter(m => m.category === 'STRENGTH');
    return all.filter(m => m.category === 'CARDIO');
  }

  get availableCount(): number { return this.gymState.machines().filter(m => m.status === 'AVAILABLE').length; }
  get inUseCount():    number { return this.gymState.machines().filter(m => m.status === 'IN_USE').length; }
  get reservedCount(): number { return this.gymState.machines().filter(m => m.status === 'RESERVED').length; }

  setFilter(filter: FilterTab): void { this.activeFilter.set(filter); }

  formatTimer(seconds: number): string { return this.gymState.formatTimer(seconds); }

  openMachineDetail(machine: GymMachine, event: Event): void {
    event.stopPropagation();
    this.selectedMachineId.set(machine.id);
    this.showAlternativesPanel.set(false);
  }

  closeMachineDetail(): void {
    this.selectedMachineId.set(null);
    this.showAlternativesPanel.set(false);
  }

  openAlternatives(): void { this.showAlternativesPanel.set(true); }

  private confirm(key: string): void {
    this.closeMachineDetail();
    this.snackBar.open(this.translate.instant(key), '✓', {
      duration: 3500,
      panelClass: ['routine-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  notifyWhenFree():   void { this.confirm('map.detail.notifications.notified'); }
  reportAsFree():     void { this.confirm('map.detail.notifications.reportedFree'); }
  reportAsOccupied(): void { this.confirm('map.detail.notifications.reportedOccupied'); }

  reserveMachine(): void {
    const machine = this.selectedMachine();
    if (!machine) return;
    this.gymState.createReservation(machine.id, 15 * 60);
    this.confirm('map.detail.notifications.reserved');
  }
}
