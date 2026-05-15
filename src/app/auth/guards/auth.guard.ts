import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../application/auth.store';

export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthStore);
  const router = inject(Router);
  if (auth.isAuthenticated()) return true;
  return router.createUrlTree(['/login']);
};

export const adminGuard: CanActivateFn = () => {
  const auth   = inject(AuthStore);
  const router = inject(Router);
  if (auth.isAdmin()) return true;
  return router.createUrlTree(['/client']);
};

export const clientGuard: CanActivateFn = () => {
  const auth   = inject(AuthStore);
  const router = inject(Router);
  if (auth.isClient()) return true;
  return router.createUrlTree(['/dashboard']);
};
