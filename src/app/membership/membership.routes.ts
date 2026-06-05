import { Routes } from '@angular/router';

export const membershipRoutes: Routes = [
  {
    path: 'membership',
    loadComponent: () =>
      import('./presentation/views/membership-list/membership-list.component').then(
        m => m.MembershipListComponent
      ),
  },
  {
    path: 'membership/:id',
    loadComponent: () =>
      import('./presentation/views/membership-detail/membership-detail.component').then(
        m => m.MembershipDetailComponent
      ),
  },
];
