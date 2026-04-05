// Rutas de servidor para estrategia de prerender en SSR.
import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    // Cubre cualquier ruta para permitir prerender universal.
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
