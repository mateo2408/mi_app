// Guard para evitar que usuarios autenticados vuelvan al login.
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  // Si ya inició sesión, lo lleva al dashboard privado.
  return router.createUrlTree(['/app/dashboard']);
};
