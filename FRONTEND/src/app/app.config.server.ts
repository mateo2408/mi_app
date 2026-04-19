// Configuración extra para ejecución en servidor (SSR).
import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [
    // Activa motor SSR y enlaza rutas específicas de servidor.
    provideServerRendering(withRoutes(serverRoutes))
  ]
};

// Combina configuración cliente + SSR para un único bootstrap en servidor.
export const config = mergeApplicationConfig(appConfig, serverConfig);
