import { Routes } from '@angular/router';

export const monitoringRoutes: Routes = [
  {
    path: 'monitoring',
    loadComponent: () =>
      import('./presentation/views/monitoring-dashboard/monitoring-dashboard.component').then(
        m => m.MonitoringDashboardComponent
      ),
  },
];
