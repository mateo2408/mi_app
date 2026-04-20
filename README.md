# VetCore

VetCore es una aplicacion web de gestion veterinaria con arquitectura MVC y separacion por capas:

- Vista: Angular 21 (FRONTEND)
- Controlador: rutas/controladores Express (BACKEND/routes y BACKEND/controllers)
- Modelo: esquemas Mongoose (BACKEND/models)

La logica funcional se mantiene igual: autenticacion JWT, dashboard, dueños, mascotas, citas e historia clinica.

## Objetivo de esta version

Esta version esta preparada para:

- Base de datos en MongoDB Atlas (sin dependencias locales)
- Despliegue en Render
- Sin uso de endpoints locales en entorno publicado

## Arquitectura de despliegue recomendada

1. MongoDB Atlas como base de datos principal.
2. Render Web Service para backend Express.
3. Render Static Site o Render Web Service para frontend Angular.

Si despliegas frontend y backend en el mismo servicio Node, la app usa rutas relativas `/api` y no necesita proxy externo.

## Variables de entorno (Render)

Configura estas variables en el servicio de backend:

- `MONGODB_URI`
- `JWT_SECRET`
- `CORS_ORIGIN`
- `MONGO_MAX_POOL_SIZE` (opcional, default 20)
- `MONGO_MIN_POOL_SIZE` (opcional, default 2)

Referencia: revisa `.env.example`.

## Comandos del proyecto

- `npm install`
- `npm run build`
- `npm run api`
- `npm run serve:ssr:mi_app`

## Deploy en Render (backend)

Servicio tipo Web Service:

- Root Directory: `mi_app`
- Build Command: `npm install && npm run build`
- Start Command: `npm run api`

Render asigna `PORT` automaticamente.

## Deploy en Render (frontend)

Opciones:

1. Recomendado: servir frontend desde el backend Express (build Angular + `npm run api`).
2. Alternativo: Static Site en Render apuntando a `dist/mi_app/browser` y `apiBaseUrl` relativo o dominio del backend publicado.

## Script mongosh para Atlas

Se incluyo el script:

- `scripts/atlas-init.mongosh.js`

Ejemplo de ejecucion:

```bash
mongosh "mongodb+srv://<usuario>:<password>@<cluster-url>/mi_veterinaria?retryWrites=true&w=majority&appName=<app-name>" --file scripts/atlas-init.mongosh.js
```

Este script:

- Crea/usa la base `mi_veterinaria`
- Crea colecciones principales
- Inserta usuario admin inicial (si no existe)
- Crea indices basicos

## Estructura principal

```text
mi_app/
  BACKEND/
    config/
    controllers/
    middleware/
    models/
    routes/
  FRONTEND/
    src/
  CORE/
  scripts/
```

## Nota sobre MVC

No se altero la arquitectura MVC ni la logica de negocio existente. Los cambios son de infraestructura y configuracion para operar con Atlas + Render.
