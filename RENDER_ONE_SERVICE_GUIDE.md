# Deploy en un solo sitio (Render) - VetCore

Objetivo: publicar frontend Angular y backend Express en la misma URL usando un solo Web Service de Render.

## Arquitectura

- Express levanta la API en `/api/*`.
- Express sirve Angular compilado desde `dist/mi_app/browser`.
- Angular consume API con `apiBaseUrl: /api` (misma URL, sin CORS complejo entre dominios).

## Precondiciones en el proyecto

- `npm run build` genera `dist/mi_app/browser`.
- El backend sirve archivos estaticos desde `dist/mi_app/browser`.
- Las rutas SPA tienen fallback a `index.html`.
- `FRONTEND/src/environments/environment.prod.ts` debe usar `apiBaseUrl: '/api'`.

## Configuración en Render (UN SOLO servicio)

1. Crea un Web Service (no crees Static Site separado).
2. Conecta tu repositorio GitHub.
3. Configura:
   - Root Directory: `mi_app`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run api`
4. Variables de entorno:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `CORS_ORIGIN=https://<tu-dominio-render>`
   - `MONGO_MAX_POOL_SIZE=20`
   - `MONGO_MIN_POOL_SIZE=2`
5. Deploy.

## Qué URL usar

Solo una URL, por ejemplo:

- App completa: `https://mi-app-api.onrender.com`
- API health: `https://mi-app-api.onrender.com/api/health`

No necesitas un segundo sitio para frontend.

## Pruebas después del deploy

1. Abrir la raíz `/` y validar que carga Angular.
2. Abrir `/api/health` y validar `{ "status": "ok" }`.
3. Probar login.
4. Probar CRUD de dueños/mascotas/citas/registros.

## Errores comunes

### 1) Frontend en 404

Causa: se creó un Static Site separado sin publish correcto.

Solución:
- Usa un solo Web Service.
- Elimina (o desactiva) el servicio frontend separado.

### 2) Backend raíz en 500

Causa: el backend intenta servir Angular pero no existe build.

Solución:
- Verifica Build Command: `npm install && npm run build`.
- Confirma que Render no cambió el Root Directory.

### 3) Error interno del servidor en API

Causa frecuente: variables incorrectas de Atlas o acceso de red en Atlas.

Solución:
- Revisar `MONGODB_URI` en Render.
- Revisar usuario/password en Atlas.
- Revisar Network Access para IPs de Render.

## Recomendación final

Para este proyecto, el mejor flujo es:

- 1 repositorio
- 1 Web Service en Render
- 1 dominio
- `/api` para backend y `/` para frontend
