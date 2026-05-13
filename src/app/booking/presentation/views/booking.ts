import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';

export interface Booking {
  id: string;
  machineKey: string;
  zoneKey: string;
  icon: string;
  timerSeconds: number;
}

interface AvailableMachine {
  key: string;
  zoneKey: string;
  icon: string;
}

@Component({
  selector: 'app-booking',
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
  templateUrl: './booking.html',
  styleUrl: './booking.css',
})
export class BookingComponent implements OnInit, OnDestroy {
  // Signal — every .update() notifies Angular's scheduler without zone.js
  bookings = signal<Booking[]>([
    { id: '1', machineKey: 'rackSentadilla2',    zoneKey: 'fuerza', icon: 'fitness_center', timerSeconds: 525 },
    { id: '2', machineKey: 'bancoPechoInclinado', zoneKey: 'fuerza', icon: 'fitness_center', timerSeconds: 275 },
  ]);

  availableMachines: AvailableMachine[] = [
    { key: 'cinta1',            zoneKey: 'cardio', icon: 'directions_run' },
    { key: 'cinta2',            zoneKey: 'cardio', icon: 'directions_run' },
    { key: 'prensaPiernas',     zoneKey: 'fuerza', icon: 'fitness_center' },
    { key: 'rackSentadilla1',   zoneKey: 'fuerza', icon: 'fitness_center' },
    { key: 'bancoPechoPlano',   zoneKey: 'fuerza', icon: 'fitness_center' },
    { key: 'poleaAlta',         zoneKey: 'fuerza', icon: 'fitness_center' },
    { key: 'maquinaRemo',       zoneKey: 'cardio', icon: 'rowing'         },
  ];

  durations = [10, 15, 20];

  showModal             = false;
  selectedMachine: string | null = null;
  selectedDuration      = 15;

  private timerInterval: any;
  private nextId = 3;

  ngOnInit(): void {
    this.timerInterval = setInterval(() => {
      this.bookings.update(list =>
        list.map(b => ({ ...b, timerSeconds: b.timerSeconds > 0 ? b.timerSeconds - 1 : 0 }))
      );
    }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.timerInterval);
  }

  isExpired(b: Booking): boolean {
    return b.timerSeconds === 0;
  }

  cancelBooking(id: string): void {
    this.bookings.update(list => list.filter(b => b.id !== id));
  }

  formatTimer(seconds: number): string {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  openModal(): void {
    this.showModal        = true;
    this.selectedMachine  = null;
    this.selectedDuration = 15;
  }

  closeModal(): void {
    this.showModal = false;
  }

  createBooking(): void {
    if (!this.selectedMachine) return;
    const machine = this.availableMachines.find(m => m.key === this.selectedMachine)!;
    this.bookings.update(list => [...list, {
      id:           String(this.nextId++),
      machineKey:   machine.key,
      zoneKey:      machine.zoneKey,
      icon:         machine.icon,
      timerSeconds: this.selectedDuration * 60,
    }]);
    this.closeModal();
  }
}
