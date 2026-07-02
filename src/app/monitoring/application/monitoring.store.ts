import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { MonitoringApi } from '../infrastructure/monitoring-api';
import {
  SensorSessionResource,
  SensorReadingResource,
  CameraSensorResource,
  MotionSensorResource,
  AnomalyResource,
  SessionTrackerResource,
  SessionTrackerCreatedResource,
} from '../infrastructure/monitoring-response';
import {
  CreateSessionTrackerRequest,
  ReportAnomalyRequest,
} from '../infrastructure/monitoring-request';

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

  // ── Sensors / anomaly reporting / session tracking (write-side actions) ────

  private readonly _actionLoading = signal(false);
  private readonly _actionError   = signal<string | null>(null);

  readonly actionLoading = this._actionLoading.asReadonly();
  readonly actionError   = this._actionError.asReadonly();

  private readonly _cameraSensors  = signal<CameraSensorResource[]>([]);
  private readonly _motionSensors  = signal<MotionSensorResource[]>([]);
  private readonly _anomalyReports = signal<AnomalyResource[]>([]);
  private readonly _trackedSessions = signal<SessionTrackerResource[]>([]);

  readonly cameraSensors   = this._cameraSensors.asReadonly();
  readonly motionSensors   = this._motionSensors.asReadonly();
  readonly anomalyReports  = this._anomalyReports.asReadonly();
  readonly trackedSessions = this._trackedSessions.asReadonly();

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

  loadCameraSensors(): void {
    this._actionLoading.set(true);
    this._actionError.set(null);
    this.api.getAllCameraSensors()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: sensors => {
          this._cameraSensors.set(sensors);
          this._actionLoading.set(false);
        },
        error: err => {
          this._actionError.set(this.formatError(err, 'No se pudieron cargar las cámaras registradas'));
          this._actionLoading.set(false);
        },
      });
  }

  loadMotionSensors(): void {
    this._actionLoading.set(true);
    this._actionError.set(null);
    this.api.getAllMotionSensors()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: sensors => {
          this._motionSensors.set(sensors);
          this._actionLoading.set(false);
        },
        error: err => {
          this._actionError.set(this.formatError(err, 'No se pudieron cargar los sensores de movimiento registrados'));
          this._actionLoading.set(false);
        },
      });
  }

  registerCameraSensor(equipmentId: string): void {
    this._actionLoading.set(true);
    this._actionError.set(null);
    this.api.registerCameraSensor({ equipmentId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: sensor => {
          this._cameraSensors.update(list => [sensor, ...list]);
          this._actionLoading.set(false);
        },
        error: err => {
          this._actionError.set(this.formatError(err, 'No se pudo registrar la cámara'));
          this._actionLoading.set(false);
        },
      });
  }

  registerMotionSensor(equipmentId: string): void {
    this._actionLoading.set(true);
    this._actionError.set(null);
    this.api.registerMotionSensor({ equipmentId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: sensor => {
          this._motionSensors.update(list => [sensor, ...list]);
          this._actionLoading.set(false);
        },
        error: err => {
          this._actionError.set(this.formatError(err, 'No se pudo registrar el sensor de movimiento'));
          this._actionLoading.set(false);
        },
      });
  }

  captureCameraMotion(sessionTrackerId: string, movementDetectedViaVideo: boolean): void {
    this._actionLoading.set(true);
    this._actionError.set(null);
    this.api.captureCameraMotion({ sessionTrackerId, movementDetectedViaVideo })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: session => {
          this.upsertTrackedSession(session);
          this._actionLoading.set(false);
        },
        error: err => {
          this._actionError.set(this.formatError(err, 'No se pudo registrar la lectura de la cámara'));
          this._actionLoading.set(false);
        },
      });
  }

  captureMotionSensorReading(sessionTrackerId: string, movementDetectedViaSensor: boolean): void {
    this._actionLoading.set(true);
    this._actionError.set(null);
    this.api.captureMotionSensorReading({ sessionTrackerId, movementDetectedViaSensor })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: session => {
          this.upsertTrackedSession(session);
          this._actionLoading.set(false);
        },
        error: err => {
          this._actionError.set(this.formatError(err, 'No se pudo registrar la lectura del sensor de movimiento'));
          this._actionLoading.set(false);
        },
      });
  }

  reportAnomaly(request: ReportAnomalyRequest): void {
    this._actionLoading.set(true);
    this._actionError.set(null);
    this.api.reportAnomaly(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: anomaly => {
          this._anomalyReports.update(list => [anomaly, ...list]);
          this._actionLoading.set(false);
        },
        error: err => {
          this._actionError.set(this.formatError(err, 'No se pudo reportar la anomalía'));
          this._actionLoading.set(false);
        },
      });
  }

  createSessionTracker(request: CreateSessionTrackerRequest): void {
    this._actionLoading.set(true);
    this._actionError.set(null);
    this.api.createSessionTracker(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (created: SessionTrackerCreatedResource) => {
          this.upsertTrackedSession({
            sessionTrackerId:    created.sessionTrackerId,
            reservationId:       created.reservationId,
            continouosActivitiy: created.continuousActivity,
            seconds:             created.seconds,
            sessionIsActive:     created.sessionIsActive,
            sessionIsInactive:   created.sessionIsInactive,
          });
          this._actionLoading.set(false);
        },
        error: err => {
          this._actionError.set(this.formatError(err, 'No se pudo crear el rastreador de sesión'));
          this._actionLoading.set(false);
        },
      });
  }

  verifySessionUsage(sessionTrackerId: string): void {
    this._actionLoading.set(true);
    this._actionError.set(null);
    this.api.verifySessionUsage(sessionTrackerId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: session => {
          this.upsertTrackedSession(session);
          this._actionLoading.set(false);
        },
        error: err => {
          this._actionError.set(this.formatError(err, 'No se pudo verificar el uso de la sesión'));
          this._actionLoading.set(false);
        },
      });
  }

  endUsageSession(sessionTrackerId: string): void {
    this._actionLoading.set(true);
    this._actionError.set(null);
    this.api.endUsageSession(sessionTrackerId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: session => {
          this.upsertTrackedSession(session);
          this._actionLoading.set(false);
        },
        error: err => {
          this._actionError.set(this.formatError(err, 'No se pudo finalizar la sesión'));
          this._actionLoading.set(false);
        },
      });
  }

  calculateSessionTime(sessionTrackerId: string): void {
    this._actionLoading.set(true);
    this._actionError.set(null);
    this.api.calculateSessionTime(sessionTrackerId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: session => {
          this.upsertTrackedSession(session);
          this._actionLoading.set(false);
        },
        error: err => {
          this._actionError.set(this.formatError(err, 'No se pudo calcular el tiempo de sesión'));
          this._actionLoading.set(false);
        },
      });
  }

  private upsertTrackedSession(session: SessionTrackerResource): void {
    this._trackedSessions.update(list => {
      const idx = list.findIndex(s => s.sessionTrackerId === session.sessionTrackerId);
      if (idx === -1) return [session, ...list];
      const copy = [...list];
      copy[idx] = session;
      return copy;
    });
  }

  private formatError(error: unknown, fallback: string): string {
    if (error instanceof Error) return error.message || fallback;
    return fallback;
  }
}
