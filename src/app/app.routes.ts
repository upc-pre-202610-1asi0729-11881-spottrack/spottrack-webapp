import { Routes } from '@angular/router';
import { Layout } from './shared/presentation/components/layout/layout';
import { equipmentRoutes } from './equipment/presentation/views/equipment.routes';
import { authGuard, adminGuard, clientGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/presentation/views/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      // ── Admin routes ────────────────────────────────────────────────────────
      {
        path: '',
        canActivate: [adminGuard],
        children: [
          {
            path: 'dashboard',
            loadComponent: () =>
              import('./dashboard/presentation/views/dashboard.component').then(m => m.DashboardComponent),
          },
          ...equipmentRoutes,
          {
            path: 'iot',
            loadComponent: () =>
              import('./iot/presentation/views/iot-monitoring.component').then(m => m.IotMonitoringComponent),
          },
          {
            path: 'maintenance',
            loadComponent: () =>
              import('./maintenance/presentation/views/maintenance.component').then(m => m.MaintenanceComponent),
          },
          {
            path: 'maintenance/new-ticket',
            loadComponent: () =>
              import('./maintenance/presentation/views/new-ticket/new-ticket.component').then(m => m.NewTicketComponent),
          },
          {
            path: 'analytics',
            loadComponent: () =>
              import('./analytics/presentation/views/analytics.component').then(m => m.AnalyticsComponent),
          },
          {
            path: 'alerts',
            loadComponent: () =>
              import('./alerts/presentation/views/alerts.component').then(m => m.AlertsComponent),
          },
          {
            path: 'configuration',
            loadComponent: () =>
              import('./configuration/presentation/views/configuration.component').then(m => m.ConfigurationComponent),
          },
        ],
      },

      // ── Client routes ───────────────────────────────────────────────────────
      {
        path: '',
        canActivate: [clientGuard],
        children: [
          {
            path: 'client',
            loadComponent: () =>
              import('./client/presentation/views/client-home.component').then(m => m.ClientHomeComponent),
          },
          {
            path: 'map',
            loadComponent: () =>
              import('./map/map.component').then(m => m.MapComponent),
          },
        ],
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
