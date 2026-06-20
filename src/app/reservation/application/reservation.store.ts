import { inject, Injectable } from '@angular/core';
import { GymStateService, GymMachine } from '../../shared/application/gym-state.service';

@Injectable({ providedIn: 'root' })
export class ReservationStore {

  private readonly gymState = inject(GymStateService);

  readonly reservations        = this.gymState.reservedMachines;
  readonly pendingReservations = this.gymState.pendingMachines;
  readonly availableMachines   = this.gymState.availableMachines;
  readonly expiredReservations = this.gymState.expiredReservations;

  createReservation(machineId: string, durationSeconds: number): void {
    this.gymState.createReservation(machineId, durationSeconds);
  }

  activateReservation(machineId: string): void {
    this.gymState.activateReservation(machineId);
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

  isExpired(machine: GymMachine): boolean {
    return machine.timerSeconds === 0;
  }
}
