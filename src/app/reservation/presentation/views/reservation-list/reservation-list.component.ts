import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { ReservationStore } from '../../../application/reservation.store';

@Component({
  selector: 'app-reservation-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    TranslateModule,
  ],
  templateUrl: './reservation-list.component.html',
  styleUrl: './reservation-list.component.css',
})
export class ReservationListComponent {
  readonly store = inject(ReservationStore);

  readonly reservations        = this.store.reservations;
  readonly availableMachines   = this.store.availableMachines;
  readonly expiredReservations = this.store.expiredReservations;

  durations = [
    { seconds: 10,        labelKey: 'booking.modal.option10s' },
    { seconds: 10 * 60,   labelKey: 'booking.modal.option10m' },
    { seconds: 15 * 60,   labelKey: 'booking.modal.option15m' },
    { seconds: 20 * 60,   labelKey: 'booking.modal.option20m' },
  ];

  showModal                = false;
  selectedMachineId: string | null = null;
  selectedDurationSeconds  = 15 * 60;

  isExpired(machineId: string): boolean {
    const m = this.reservations().find(r => r.id === machineId);
    return m ? this.store.isExpired(m) : false;
  }

  cancelReservation(machineId: string): void { this.store.cancelReservation(machineId); }
  dismissExpired(machineId: string): void    { this.store.dismissExpired(machineId); }
  formatTimer(seconds: number): string        { return this.store.formatTimer(seconds); }
  getZoneKey(category: string): string        { return this.store.getZoneKey(category); }

  openModal(): void  { this.showModal = true; this.selectedMachineId = null; this.selectedDurationSeconds = 15 * 60; }
  closeModal(): void { this.showModal = false; }

  createReservation(): void {
    if (!this.selectedMachineId) return;
    this.store.createReservation(this.selectedMachineId, this.selectedDurationSeconds);
    this.closeModal();
  }
}
