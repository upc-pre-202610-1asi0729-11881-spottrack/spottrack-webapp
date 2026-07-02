import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MonitoringStore } from '../../../application/monitoring.store';
import { SessionTrackerResource } from '../../../infrastructure/monitoring-response';

@Component({
  selector: 'app-session-tracking',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './session-tracking.html',
  styleUrl: './session-tracking.scss',
})
export class SessionTrackingComponent {
  private readonly router = inject(Router);
  readonly store = inject(MonitoringStore);

  readonly loading = this.store.actionLoading;
  readonly error = this.store.actionError;
  readonly trackedSessions = this.store.trackedSessions;

  readonly selectedSessionId = signal<string | null>(null);
  readonly selectedSession = computed<SessionTrackerResource | undefined>(() =>
    this.trackedSessions().find(s => s.sessionTrackerId === this.selectedSessionId())
  );

  form = {
    sessionTrackerId: this.generateId(),
    reservationId: '',
    continuousActivity: '01:00:00',
    seconds: '00:00:00',
  };

  createSession(): void {
    if (!this.form.sessionTrackerId.trim() || !this.form.reservationId.trim()) return;
    this.store.createSessionTracker({
      sessionTrackerId: this.form.sessionTrackerId.trim(),
      reservationId: this.form.reservationId.trim(),
      sessionIsActive: true,
      sessionIsInactive: false,
      seconds: this.form.seconds,
      continuousActivity: this.form.continuousActivity,
    });
    this.selectedSessionId.set(this.form.sessionTrackerId.trim());
    this.form = {
      sessionTrackerId: this.generateId(),
      reservationId: '',
      continuousActivity: '01:00:00',
      seconds: '00:00:00',
    };
  }

  select(sessionTrackerId: string): void {
    this.selectedSessionId.set(sessionTrackerId);
  }

  verify(): void {
    const id = this.selectedSessionId();
    if (id) this.store.verifySessionUsage(id);
  }

  endSession(): void {
    const id = this.selectedSessionId();
    if (id) this.store.endUsageSession(id);
  }

  calculateTime(): void {
    const id = this.selectedSessionId();
    if (id) this.store.calculateSessionTime(id);
  }

  captureCameraMotion(detected: boolean): void {
    const id = this.selectedSessionId();
    if (id) this.store.captureCameraMotion(id, detected);
  }

  captureMotionReading(detected: boolean): void {
    const id = this.selectedSessionId();
    if (id) this.store.captureMotionSensorReading(id, detected);
  }

  private generateId(): string {
    return typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `session-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }

  back(): void {
    this.router.navigate(['/monitoring']);
  }
}
