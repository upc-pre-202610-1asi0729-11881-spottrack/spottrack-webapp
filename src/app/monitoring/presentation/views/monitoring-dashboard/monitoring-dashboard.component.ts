import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { MonitoringStore } from '../../../application/monitoring.store';

@Component({
  selector: 'app-monitoring-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, TranslateModule],
  templateUrl: './monitoring-dashboard.component.html',
  styleUrl:    './monitoring-dashboard.component.css',
})
export class MonitoringDashboardComponent {
  readonly store = inject(MonitoringStore);

  readonly loading      = this.store.loading;
  readonly error        = this.store.error;
  readonly sessions     = this.store.sessions;
  readonly activeSessions = this.store.activeSessions;
  readonly anomalies    = this.store.anomalies;
  readonly totalSessions  = this.store.totalSessions;
  readonly activeCount    = this.store.activeCount;
  readonly anomalyCount   = this.store.anomalyCount;
  readonly anomalyRate    = this.store.anomalyRate;

  formatTime(isoString: string): string {
    return new Date(isoString).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  }
}
