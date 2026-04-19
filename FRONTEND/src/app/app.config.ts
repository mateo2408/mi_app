// Configuración global del lado cliente (browser runtime).
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { authInterceptor } from './core/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Captura errores globales no manejados para facilitar diagnóstico.
    provideBrowserGlobalErrorListeners(),
    // Registro del árbol de rutas cliente.
    provideRouter(routes),
    // Habilita hidratación en SSR para reutilizar HTML prerenderizado.
    provideClientHydration(withEventReplay()),
    // Inyecta interceptores HTTP (JWT, logs, etc.).
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
