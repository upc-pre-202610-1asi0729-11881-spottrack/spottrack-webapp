import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Iot, IotStatus } from '../domain/model/iot.entity';
import { IotApi } from '../infrastructure/iot-api';

@Injectable({ providedIn: 'root' })
export class IotStore {
  private readonly api       = inject(IotApi);
  private readonly destroyRef = inject(DestroyRef);

  private readonly devicesSignal          = signal<Iot[]>([]);
  private readonly loadingSignal          = signal(false);
  private readonly errorSignal            = signal<string | null>(null);
  private readonly reconnectedDeviceSignal = signal<Iot | null>(null);
  private readonly dismissedAlertIds      = signal<Set<number>>(new Set());

  readonly devices           = this.devicesSignal.asReadonly();
  readonly loading           = this.loadingSignal.asReadonly();
  readonly error             = this.errorSignal.asReadonly();
  readonly reconnectedDevice = this.reconnectedDeviceSignal.asReadonly();

  readonly deviceCount  = computed(() => this.devices().length);
  readonly onlineCount  = computed(() => this.devices().filter(d => d.status === IotStatus.ONLINE).length);
  readonly offlineCount = computed(() => this.devices().filter(d => d.status === IotStatus.OFFLINE).length);
  readonly warningCount = computed(() => this.devices().filter(d => d.status === IotStatus.WARNING).length);
  readonly avgBattery   = computed(() => {
    const list = this.devices();
    if (!list.length) return 0;
    return Math.round(list.reduce((sum, d) => sum + d.batteryLevel, 0) / list.length);
  });

  readonly activeAlerts = computed(() => {
    const dismissed = this.dismissedAlertIds();
    return this.devices().filter(d =>
      !dismissed.has(d.id) &&
      (d.status === IotStatus.OFFLINE || d.status === IotStatus.WARNING)
    );
  });

  // Backward-compat aliases
  readonly activeCount   = this.onlineCount;
  readonly inactiveCount = this.offlineCount;

  constructor() {
    this.loadDevices();
  }

  refresh(): void {
    this.loadDevices();
  }

  /**
   * T04: Optimistically marks a disconnected sensor as ONLINE and shows the
   * reconnection modal — mirrors state sync when a node reconnects.
   */
  investigateAlert(sensor: Iot): void {
    sensor.status = IotStatus.ONLINE;
    this.devicesSignal.update(list => [...list]);
    this.reconnectedDeviceSignal.set(sensor);
  }

  scheduleReplacement(sensorId: number): void {
    this.dismissedAlertIds.update(s => new Set([...s, sensorId]));
  }

  dismissReconnectedModal(): void {
    this.reconnectedDeviceSignal.set(null);
  }

  getDeviceById(id: number) {
    return computed(() => this.devices().find(d => d.id === id));
  }

  private loadDevices(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    const prev = [...this.devicesSignal()];
    this.api.getDevices().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: list => {
        this.detectReconnections(prev, list);
        this.devicesSignal.set(list);
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err));
        this.loadingSignal.set(false);
      },
    });
  }

  private detectReconnections(prev: Iot[], next: Iot[]): void {
    const reconnected = next.find(n =>
      n.status === IotStatus.ONLINE &&
      prev.some(p => p.id === n.id && p.status === IotStatus.OFFLINE)
    );
    if (reconnected) this.reconnectedDeviceSignal.set(reconnected);
  }

  private formatError(error: unknown): string {
    if (error instanceof Error) return error.message;
    return 'Failed to load devices';
  }
}
