import { Routes } from '@angular/router';
import { Layout } from './shared/presentation/components/layout/layout';
import { equipmentRoutes } from './equipment/presentation/views/equipment.routes';
import { authGuard, adminGuard, clientGuard } from './auth/guards/auth.guard';
import { ProfileView } from './profiles/presentation/views/profile-view';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/presentation/views/login/login').then((m) => m.LoginComponent),
  },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: 'profile', component: ProfileView },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      // ── Admin routes ────────────────────────────────────────────────────────
      {
        path: '',
        canActivate: [adminGuard],
        children: [
          {
            path: 'dashboard',
            loadComponent: () =>
              import('./dashboard/presentation/views/dashboard').then(
                (m) => m.DashboardComponent,
              ),
          },
          ...equipmentRoutes,
          {
            path: 'iot',
            loadComponent: () =>
              import('./iot/presentation/views/iot-monitoring').then(
                (m) => m.IotMonitoringComponent,
              ),
          },
          {
            path: 'maintenance',
            loadComponent: () =>
              import('./maintenance/presentation/views/maintenance').then(
                (m) => m.MaintenanceComponent,
              ),
          },
          {
            path: 'maintenance/new-ticket',
            loadComponent: () =>
              import('./maintenance/presentation/views/new-ticket/new-ticket').then(
                (m) => m.NewTicketComponent,
              ),
          },
          {
            path: 'analytics',
            loadComponent: () =>
              import('./analytics/presentation/views/analytics').then(
                (m) => m.AnalyticsComponent,
              ),
          },
          {
            path: 'financial-impact',
            loadComponent: () =>
              import('./financial-impact/presentation/views/financial-impact').then(
                (m) => m.FinancialImpactComponent,
              ),
          },
          {
            path: 'alerts',
            loadComponent: () =>
              import('./alerts/presentation/views/alerts').then((m) => m.AlertsComponent),
          },
          {
            path: 'configuration',
            loadComponent: () =>
              import('./configuration/presentation/views/configuration').then(
                (m) => m.ConfigurationComponent,
              ),
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
              import('./client/presentation/views/client-home').then(
                (m) => m.ClientHomeComponent,
              ),
          },
          {
            path: 'map',
            loadComponent: () => import('./map/presentation/views/map').then((m) => m.MapComponent),
          },
          {
            path: 'bookings',
            loadComponent: () =>
              import('./booking/presentation/views/booking').then(
                (m) => m.BookingComponent,
              ),
          },
          {
            path: 'routines',
            loadComponent: () =>
              import('./routines/presentation/views/routines').then(
                (m) => m.RoutinesComponent,
              ),
          },
        ],
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
