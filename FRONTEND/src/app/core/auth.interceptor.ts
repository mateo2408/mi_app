// Interceptor que adjunta el JWT si existe sesión activa.
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  const requestWithAuth = token
    ? request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : request;

  return next(requestWithAuth).pipe(
    catchError((error) => {
      const isUnauthorized = error?.status === 401;
      const isAuthEndpoint = request.url.includes('/auth/login');

      if (isUnauthorized && !isAuthEndpoint) {
        authService.logout();
        router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};
