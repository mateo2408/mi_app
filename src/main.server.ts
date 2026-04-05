// Punto de entrada para renderizado SSR de Angular.
import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { config } from './app/app.config.server';

// Exportado como función para que el runtime SSR inyecte el contexto de ejecución.
const bootstrap = (context: BootstrapContext) =>
    bootstrapApplication(App, config, context);

export default bootstrap;
