import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { GymStateService, GymMachine } from '../../../shared/application/gym-state.service';

@Component({
  selector: 'app-reservation',
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
  templateUrl: './reservation.html',
  styleUrl: './reservation.css',
})
export class ReservationComponent {
  private gymState = inject(GymStateService);

  readonly reservations        = this.gymState.reservedMachines;
  readonly availableMachines   = this.gymState.availableMachines;
  readonly expiredReservations = this.gymState.expiredReservations;

  durations = [
    { seconds: 10,        labelKey: 'booking.modal.option10s' },
    { seconds: 10 * 60,   labelKey: 'booking.modal.option10m' },
    { seconds: 15 * 60,   labelKey: 'booking.modal.option15m' },
    { seconds: 20 * 60,   labelKey: 'booking.modal.option20m' },
  ];

  showModal                = false;
  selectedMachineId: string | null = null;
  selectedDurationSeconds  = 15 * 60;

  isExpired(machine: GymMachine): boolean {
    return machine.timerSeconds === 0;
  }

  cancelReservation(machineId: string): void {
    this.gymState.cancelReservation(machineId);
  }

  dismissExpired(machineId: string): void {
    this.gymState.dismissExpiredReservation(machineId);
  }

  formatTimer(seconds: number): string {
    return this.gymState.formatTimer(seconds);
  }

  getZoneKey(category: string): string {
    return this.gymState.getZoneKey(category);
  }

  openModal(): void {
    this.showModal              = true;
    this.selectedMachineId      = null;
    this.selectedDurationSeconds = 15 * 60;
  }

  closeModal(): void {
    this.showModal = false;
  }

  createReservation(): void {
    if (!this.selectedMachineId) return;
    this.gymState.createReservation(this.selectedMachineId, this.selectedDurationSeconds);
    this.closeModal();
  }
}
