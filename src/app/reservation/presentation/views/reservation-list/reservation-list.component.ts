import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { ReservationStore } from '../../../application/reservation.store';
import { ContextMenuDirective } from '../../../../shared/presentation/directives/context-menu.directive';
import { ContextMenuItem } from '../../../../shared/application/context-menu.service';

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
    ContextMenuDirective,
  ],
  templateUrl: './reservation-list.component.html',
  styleUrl: './reservation-list.component.css',
})
export class ReservationListComponent implements OnInit {
  readonly store = inject(ReservationStore);

  readonly reservations        = this.store.reservations;
  readonly pendingReservations = this.store.pendingReservations;
  readonly availableMachines   = this.store.availableMachines;
  readonly expiredReservations = this.store.expiredReservations;
  readonly history             = this.store.history;
  readonly historyLoading      = this.store.historyLoading;
  readonly reservationError    = this.store.reservationError;
  readonly creating            = this.store.creating;

  readonly pageSize  = 5;
  readonly pageIndex = signal(0);

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.history().length / this.pageSize))
  );

  readonly paginatedHistory = computed(() => {
    const start = this.pageIndex() * this.pageSize;
    return this.history().slice(start, start + this.pageSize);
  });

  durations = [
    { seconds: 10,        labelKey: 'reservation.modal.option10s' },
    { seconds: 10 * 60,   labelKey: 'reservation.modal.option10m' },
    { seconds: 15 * 60,   labelKey: 'reservation.modal.option15m' },
    { seconds: 20 * 60,   labelKey: 'reservation.modal.option20m' },
  ];

  showModal                = false;
  selectedMachineId: string | null = null;
  selectedDurationSeconds  = 15 * 60;

  ngOnInit(): void {
    this.store.loadHistory();
  }

  isExpired(machineId: string): boolean {
    const m = this.reservations().find(r => r.id === machineId);
    return m ? this.store.isExpired(m) : false;
  }

  activateReservation(machineId: string): void { this.store.activateReservation(machineId); }
  cancelReservation(machineId: string):   void { this.store.cancelReservation(machineId); }
  dismissExpired(machineId: string):      void { this.store.dismissExpired(machineId); }
  formatTimer(seconds: number):           string { return this.store.formatTimer(seconds); }
  getZoneKey(category: string):           string { return this.store.getZoneKey(category); }

  openModal():  void { this.showModal = true; this.selectedMachineId = null; this.selectedDurationSeconds = 15 * 60; this.store.clearError(); }
  closeModal(): void { this.showModal = false; this.store.clearError(); }

  createReservation(): void {
    if (!this.selectedMachineId) return;
    this.store.createReservation(this.selectedMachineId, this.selectedDurationSeconds);
    this.closeModal();
  }

  prevPage(): void { this.pageIndex.update(i => Math.max(0, i - 1)); }
  nextPage(): void { this.pageIndex.update(i => Math.min(this.totalPages() - 1, i + 1)); }

  refreshHistory(): void {
    this.pageIndex.set(0);
    this.store.loadHistory();
  }

  reservationMenu(machineId: string): ContextMenuItem[] {
    return [
      { label: 'Cancel reservation', icon: 'cancel', action: () => this.cancelReservation(machineId) },
      { label: '', icon: '', separator: true, action: () => {} },
      { label: 'New reservation',    icon: 'add',    action: () => this.openModal() },
    ];
  }

  equipmentName(equipmentId: string): string {
    return this.store.getEquipmentName(equipmentId);
  }

  statusClass(status: string): string {
    switch (status) {
      case 'ACTIVE':    return 'status-active';
      case 'EXPIRED':   return 'status-expired';
      case 'CANCELLED': return 'status-cancelled';
      case 'ENDED':     return 'status-ended';
      default:          return '';
    }
  }

  formatDate(iso: string): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      + ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }

  trimTime(t: string): string {
    return t ? t.slice(0, 5) : '—';
  }
}
