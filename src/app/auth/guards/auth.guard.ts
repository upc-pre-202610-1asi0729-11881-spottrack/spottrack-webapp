import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { AuthStore } from '../application/auth.store';

export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthStore);
  const router = inject(Router);
  if (auth.isAuthenticated()) return true;
  return router.createUrlTree(['/login']);
};

// canMatch guards: return boolean so Angular falls through to the next sibling
// route group instead of triggering a redirect loop.
export const adminGuard: CanMatchFn = () => inject(AuthStore).isAdmin();
export const clientGuard: CanMatchFn = () => inject(AuthStore).isClient();
