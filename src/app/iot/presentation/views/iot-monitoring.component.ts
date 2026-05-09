import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { IotStore } from '../../application/iot.store';
import { Iot, IotStatus } from '../../domain/model/iot.entity';

@Component({
  selector: 'app-iot-monitoring',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    MatTableModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './iot-monitoring.component.html',
  styleUrl: './iot-monitoring.component.scss',
})
export class IotMonitoringComponent {
  private store = inject(IotStore);

  readonly IotStatus = IotStatus;
  readonly displayedColumns = [
    'id', 'equipmentId', 'location', 'status',
    'lastHeartbeat', 'batteryLevel', 'signalStrength', 'firmwareVersion',
  ];

  readonly isLoading        = this.store.loading;
  readonly deviceCount      = this.store.deviceCount;
  readonly onlineCount      = this.store.onlineCount;
  readonly offlineCount     = this.store.offlineCount;
  readonly avgBattery       = this.store.avgBattery;
  readonly activeAlerts     = this.store.activeAlerts;
  readonly reconnectedDevice = this.store.reconnectedDevice;

  searchQuery  = signal('');
  statusFilter = signal<IotStatus | ''>('');

  readonly filteredDevices = computed(() => {
    const q      = this.searchQuery().toLowerCase();
    const status = this.statusFilter();
    return this.store.devices().filter(d => {
      const matchesSearch =
        !q ||
        d.location.toLowerCase().includes(q) ||
        d.equipmentId.toString().includes(q) ||
        `sns-${d.id.toString().padStart(3, '0')}`.includes(q);
      const matchesStatus = !status || d.status === status;
      return matchesSearch && matchesStatus;
    });
  });

  sensorId(id: number): string {
    return `SNS-${id.toString().padStart(3, '0')}`;
  }

  statusIcon(status: IotStatus): string {
    if (status === IotStatus.ONLINE)  return 'sensors';
    if (status === IotStatus.WARNING) return 'warning';
    return 'sensors_off';
  }

  batteryIcon(level: number): string {
    if (level === 0)  return 'battery_0_bar';
    if (level < 20)   return 'battery_1_bar';
    if (level < 40)   return 'battery_2_bar';
    if (level < 60)   return 'battery_3_bar';
    if (level < 80)   return 'battery_5_bar';
    return 'battery_full';
  }

  batteryClass(level: number): string {
    if (level < 20) return 'battery--critical';
    if (level < 50) return 'battery--low';
    return 'battery--ok';
  }

  onSearchChange(v: string): void        { this.searchQuery.set(v); }
  onStatusFilterChange(v: string): void  { this.statusFilter.set(v as IotStatus | ''); }

  onRefresh(): void { this.store.refresh(); }

  onInvestigate(sensor: Iot): void { this.store.investigateAlert(sensor); }

  onScheduleReplacement(sensorId: number): void { this.store.scheduleReplacement(sensorId); }

  onDismissModal(): void { this.store.dismissReconnectedModal(); }
}
