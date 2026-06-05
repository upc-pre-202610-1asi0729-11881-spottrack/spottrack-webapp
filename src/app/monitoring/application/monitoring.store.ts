import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { MonitoringApi } from '../infrastructure/monitoring-api';
import { SensorSessionResource, SensorReadingResource } from '../infrastructure/monitoring-response';

@Injectable({ providedIn: 'root' })
export class MonitoringStore {

  private readonly api        = inject(MonitoringApi);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _sessions = signal<SensorSessionResource[]>([]);
  private readonly _readings = signal<SensorReadingResource[]>([]);
  private readonly _loading  = signal(false);
  private readonly _error    = signal<string | null>(null);

  readonly loading = this._loading.asReadonly();
  readonly error   = this._error.asReadonly();

  readonly sessions = this._sessions.asReadonly();
  readonly readings = this._readings.asReadonly();

  readonly activeSessions = computed(() =>
    this._sessions().filter(s => s.end_time === null)
  );

  readonly anomalies = computed(() =>
    this._sessions().filter(s => s.anomaly_detected)
  );

  readonly totalSessions  = computed(() => this._sessions().length);
  readonly activeCount    = computed(() => this.activeSessions().length);
  readonly anomalyCount   = computed(() => this.anomalies().length);
  readonly anomalyRate    = computed(() => {
    const total = this.totalSessions();
    return total ? Math.round((this.anomalyCount() / total) * 100) : 0;
  });

  constructor() { this.load(); }

  private load(): void {
    this._loading.set(true);
    this._error.set(null);

    forkJoin({
      sessions: this.api.getSessions(),
      readings: this.api.getReadings(),
    })
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: ({ sessions, readings }) => {
        this._sessions.set(sessions);
        this._readings.set(readings);
        this._loading.set(false);
      },
      error: (err: unknown) => {
        this._error.set(err instanceof Error ? err.message : 'Error al cargar datos de monitoreo');
        this._loading.set(false);
      },
    });
  }
}
