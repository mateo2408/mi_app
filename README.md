# VetCore

Aplicación web para gestión veterinaria con autenticación JWT, panel privado y módulos CRUD de dueños, mascotas, citas e historia clínica.

## Estado del proyecto

Proyecto funcional en desarrollo activo.

## Funcionalidades

- Login de usuario con correo y contraseña.
- Protección de rutas privadas en frontend y backend.
- Dashboard con resumen de entidades y listas recientes.
- Gestión de dueños.
- Gestión de mascotas.
- Gestión de citas.
- Gestión de historia clínica, incluyendo actualización de registros.

## Arquitectura

1. Angular renderiza la interfaz y maneja navegación.
2. Express expone la API REST.
3. MongoDB persiste la información.
4. JWT protege endpoints privados.
5. Docker Compose facilita levantar MongoDB local.

## Flujo de autenticación

1. El usuario abre la ruta pública `/login`.
2. El formulario envía credenciales a `POST /api/auth/login`.
3. El backend valida el usuario y la contraseña con `bcrypt`.
4. Si son válidas, responde con token JWT y perfil.
5. Angular guarda sesión en `localStorage`.
6. El guard de rutas bloquea navegación a `/app/*` sin sesión.
7. El interceptor agrega `Authorization: Bearer <token>` en cada petición privada.

## CRUD por módulo

### Dueños

- Crear: `POST /api/owners`
- Leer: `GET /api/owners`
- Actualizar: `PUT /api/owners/:id`
- Eliminar: `DELETE /api/owners/:id`

### Mascotas

- Crear: `POST /api/pets`
- Leer: `GET /api/pets`
- Actualizar: `PUT /api/pets/:id`
- Eliminar: `DELETE /api/pets/:id`

### Citas

- Crear: `POST /api/appointments`
- Leer: `GET /api/appointments`
- Actualizar: `PATCH /api/appointments/:id`
- Eliminar: `DELETE /api/appointments/:id`

### Historia clínica

- Crear: `POST /api/records`
- Leer: `GET /api/records`
- Actualizar: `PATCH /api/records/:id`
- Eliminar: `DELETE /api/records/:id`

## Endpoints principales

- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/dashboard/summary`
- `GET /api/owners`
- `GET /api/pets`
- `GET /api/appointments`
- `GET /api/records`

## Tecnologías utilizadas

- Angular
- Express
- MongoDB + Mongoose
- JSON Web Token
- bcryptjs
- Docker / Docker Compose

## Requisitos previos

- Node.js y npm
- Docker Desktop

## Instalación y ejecución

### 1) Instalar dependencias

```bash
npm install
```

### 2) Levantar MongoDB

```bash
docker compose up -d --build
```

Cadena de conexión local:

`mongodb://root:rootpass@127.0.0.1:27017/mi_veterinaria?authSource=admin`

### 3) Levantar backend

```bash
npm run api
```

API disponible en `http://localhost:3000`.

### 4) Levantar frontend

```bash
npm start
```

Aplicación disponible en `http://localhost:4200`.

## Datos de prueba

En el primer arranque se generan datos semilla.

Credenciales iniciales:

- Correo: `admin@vet.com`
- Contraseña: `Admin123*`

## Estructura del proyecto

```text
mi_app/
	server/   # API Express, modelos Mongoose y rutas
	src/      # Frontend Angular
	docker/   # Archivos de apoyo para MongoDB local
```

## Archivos clave para entender el flujo

- `src/app/pages/login.component.ts`
- `src/app/core/auth.service.ts`
- `src/app/core/auth.guard.ts`
- `src/app/core/auth.interceptor.ts`
- `src/app/pages/records.component.ts`
- `server/routes/auth.js`
- `server/middleware/auth.js`
- `server/routes/records.js`

## Acceso al proyecto

1. Clona el repositorio.
2. Entra a la carpeta `mi_app`.
3. Ejecuta los comandos de instalación y arranque de esta guía.

## Contribución

Si deseas contribuir, abre un issue con el cambio propuesto o envía un pull request con una descripción clara del ajuste.

## Autoría

Desarrollado por Mateo Cisneros.
