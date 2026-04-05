// Interceptor que adjunta el JWT si existe sesión activa.
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (!token) {
    // Peticiones públicas o sin sesión pasan sin modificación.
    return next(request);
  }

  // Clona la request para agregar cabecera Authorization.
  return next(
    request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
  );
};
