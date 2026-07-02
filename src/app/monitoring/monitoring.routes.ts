import { Routes } from '@angular/router';

export const monitoringRoutes: Routes = [
  {
    path: 'monitoring',
    loadComponent: () =>
      import('./presentation/views/monitoring-dashboard/monitoring-dashboard.component').then(
        m => m.MonitoringDashboardComponent
      ),
  },
  {
    path: 'monitoring/sensors',
    loadComponent: () =>
      import('./presentation/views/sensor-registration/sensor-registration').then(
        m => m.SensorRegistrationComponent
      ),
  },
  {
    path: 'monitoring/sessions',
    loadComponent: () =>
      import('./presentation/views/session-tracking/session-tracking').then(
        m => m.SessionTrackingComponent
      ),
  },
  {
    path: 'monitoring/anomalies/report',
    loadComponent: () =>
      import('./presentation/views/anomaly-report/anomaly-report').then(
        m => m.AnomalyReportComponent
      ),
  },
];
