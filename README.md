# VetCore

VetCore es una aplicación web de gestión veterinaria que centraliza la operación clínica y administrativa de una veterinaria: usuarios, dueños, mascotas, citas e historias clínicas.

## Resumen del core

El núcleo de la aplicación está en tres capas:

1. Autenticación segura con JWT para acceder al área privada.
2. Gestión operativa por módulos con CRUD de dueños, mascotas, citas y registros clínicos.
3. Dashboard de seguimiento con métricas generales y actividad reciente para una visión rápida del estado de la clínica.

## Arquitectura

- Frontend en Angular 21 con navegación protegida, interceptores HTTP y soporte SSR/hidratación.
- Backend en Express 5 con API REST, validación de sesión y manejo centralizado de errores.
- Persistencia en MongoDB con Mongoose.
- Seguridad basada en JWT y bcryptjs.
- Contenedorización de MongoDB con Docker Compose.

## Flujo principal de uso

1. El usuario ingresa por la ruta pública `/login`.
2. El frontend envía credenciales a `POST /api/auth/login`.
3. El backend valida el usuario contra MongoDB y compara la contraseña con `bcrypt`.
4. Si todo es correcto, devuelve un JWT y el perfil del usuario.
5. Angular guarda la sesión en `localStorage` y la restaura al recargar la app.
6. Los guards bloquean el acceso a `/app/*` sin sesión y evitan volver al login si ya hay una sesión activa.
7. El interceptor agrega `Authorization: Bearer <token>` a las peticiones privadas.

## Módulos funcionales

### Dashboard

- Muestra conteos globales de dueños, mascotas, citas e historias clínicas.
- Presenta información reciente para seguimiento operativo.
- Incluye acceso rápido para crear pacientes y citas desde el panel.

### Dueños

- Alta, consulta y eliminación de propietarios.

### Mascotas

- Registro de pacientes veterinarios vinculados a un dueño.
- Información base: nombre, especie, raza, sexo, fecha de nacimiento y notas.

### Citas

- Creación, consulta, actualización de estado y eliminación de citas.

### Historia clínica

- Registro clínico por mascota con veterinario, fecha, diagnóstico, tratamiento y observaciones.

## Endpoints principales

- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/dashboard/summary`
- `GET /api/owners`
- `GET /api/pets`
- `GET /api/appointments`
- `GET /api/records`

## Estructura del proyecto

```text
mi_app/
	BACKEND/   # API Express, rutas, middleware y modelos Mongoose
	FRONTEND/  # Aplicación Angular
	docker/    # Soporte para MongoDB local
	docker-compose.yml
	package.json
```

## Scripts disponibles

- `npm start`: levanta el frontend Angular.
- `npm run api`: levanta la API Express.
- `npm run build`: compila la app Angular.
- `npm run test`: ejecuta pruebas del frontend.
- `npm run serve:ssr:mi_app`: ejecuta la versión SSR compilada.

## Despliegue en Netlify

Esta configuración está pensada para trabajar en local con la API corriendo en tu terminal.

1. Sube el proyecto a GitHub si quieres conservar control de versiones.
2. En Netlify, conecta el repositorio y usa `npm run build` como build command.
3. Publica la carpeta `dist/mi_app/browser`.
4. Mantén la API corriendo localmente con `npm run api`.
5. Netlify redirige `/api/*` a `http://localhost:3000/api/*` mientras desarrollas en tu máquina.

Importante: esto funciona para desarrollo local. Un sitio publicado en Netlify no puede consumir el `localhost` de tu computadora desde Internet.

## Requisitos previos

- Node.js y npm.
- Docker Desktop.

## Instalación y ejecución

### 1) Instalar dependencias

```bash
npm install
```

### 2) Levantar MongoDB

```bash
docker compose up -d --build
```

Cadena local usada por Docker:

```text
mongodb://root:rootpass@127.0.0.1:27017/mi_veterinaria?authSource=admin
```

Cadena Atlas configurada en el proyecto como fallback:

```text
mongodb+srv://adminudla:UDLA@clusterudla01.iguvh9b.mongodb.net/mi_veterinaria?retryWrites=true&w=majority&appName=ClusterUDLA01
```

Si usas Atlas, puedes omitir Docker y definir `MONGODB_URI` en tu `.env`.

### 3) Levantar la API

```bash
npm run api
```

API disponible en `http://localhost:3000`.

### 4) Levantar el frontend

```bash
npm start
```

Aplicación disponible en `http://localhost:4200`.

## Datos iniciales

En el primer arranque se cargan datos semilla para facilitar las pruebas.

Credenciales iniciales:

- Correo: `admin@vet.com`
- Contraseña: `Admin123*`

## Archivos clave

- `FRONTEND/src/app/core/auth.service.ts`
- `FRONTEND/src/app/core/auth.guard.ts`
- `FRONTEND/src/app/core/auth.interceptor.ts`
- `FRONTEND/src/app/pages/dashboard.component.ts`
- `BACKEND/server.js`
- `BACKEND/db.js`
- `BACKEND/routes/auth.js`
- `BACKEND/middleware/auth.js`
- `BACKEND/routes/dashboard.js`
- `netlify.toml`
- `FRONTEND/src/environments/environment.ts`
- `FRONTEND/src/environments/environment.prod.ts`

## Texto corto para presentación

VetCore es una plataforma veterinaria de gestión integral que combina autenticación segura, administración de pacientes y dueños, control de citas y seguimiento clínico en una sola interfaz. Su arquitectura separa frontend, backend y base de datos, lo que facilita mantenimiento, escalabilidad y control de acceso.

## Autoría

Desarrollado por Mateo Cisneros.

## Configuración rápida en la nube (gratis)

1. MongoDB Atlas:
	- Crea un cluster free.
	- Crea usuario de base de datos.
	- En Network Access permite `0.0.0.0/0` temporalmente (o solo IPs necesarias).
	- Usa una cadena `MONGODB_URI` con nombre de base `mi_veterinaria`.
2. Backend en Render:
	- Crea un Web Service conectado a GitHub.
	- Root directory: `mi_app`.
	- Build command: `npm install`.
	- Start command: `npm run api`.
	- Variables: `MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGIN`.
3. Frontend en Netlify:
	- Build command: `npm run build`.
	- Publish directory: `dist/mi_app/browser`.
	- Si apuntas a backend público, no uses `localhost` en redirects de `/api/*`.
