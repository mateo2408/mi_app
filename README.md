# VetCore

Aplicación base para una veterinaria con Angular, Express y MongoDB.

## Qué hace esta base

1. `Angular` muestra la interfaz.
2. `Express` expone la API.
3. `MongoDB` guarda los datos.
4. `JWT` protege las rutas privadas.
5. `docker-compose` levanta la base de datos de forma local.

## Estructura mental del proyecto

1. Pantalla pública: inicio de sesión.
2. Zona privada: panel, dueños, mascotas, citas e historia clínica.
3. Backend: autentica usuarios y administra colecciones MongoDB.

## Datos de prueba

Al iniciar por primera vez se crean usuarios y datos semilla.

Credenciales de acceso:

- Correo: `admin@vet.com`
- Contraseña: `Admin123*`

## Paso a paso de lo que hace el código

1. El navegador abre `/login`.
2. `LoginComponent` valida el formulario y llama a `AuthService`.
3. `AuthService` envía el correo y la contraseña a `/api/auth/login`.
4. El backend busca el usuario en MongoDB y compara la contraseña con `bcrypt`.
5. Si todo coincide, el backend devuelve un `JWT` y el usuario autenticado.
6. Angular guarda la sesión en `localStorage`.
7. `authGuard` bloquea las rutas privadas si no existe sesión.
8. `authInterceptor` agrega el token en cada petición HTTP.
9. `LayoutComponent` muestra el menú lateral y el botón de cerrar sesión.
10. Las pantallas de dueños, mascotas, citas y registros llaman a la API para listar y guardar datos.
11. El backend consulta MongoDB con `mongoose` y responde en JSON.

## Endpoints principales

1. `POST /api/auth/login`
2. `GET /api/dashboard/summary`
3. `GET /api/owners`
4. `GET /api/pets`
5. `GET /api/appointments`
6. `GET /api/records`

## Cómo levantar MongoDB con Docker

1. Levanta el contenedor:

```bash
docker compose up -d --build
```

2. MongoDB quedará disponible en `mongodb://root:rootpass@127.0.0.1:27017/mi_veterinaria?authSource=admin`.

## Cómo levantar la API

1. Instala dependencias:

```bash
npm install
```

2. Arranca el backend:

```bash
npm run api
```

3. La API quedará en `http://localhost:3000`.

## Cómo levantar Angular

```bash
npm start
```

Luego abre `http://localhost:4200/`.

## Qué deberías revisar primero si quieres entender el flujo

1. `src/app/pages/login.component.ts`
2. `src/app/core/auth.service.ts`
3. `src/app/core/auth.guard.ts`
4. `src/app/core/layout.component.ts`
5. `server/routes/auth.js`
6. `server/routes/dashboard.js`
7. `server/routes/pets.js`

## Notas útiles

1. No conectes Angular directo a MongoDB.
2. Siempre pasa por la API.
3. Usa `JWT` para proteger las rutas privadas.
4. Usa `mongoose` para modelar las colecciones.
5. Mantén el login separado del core privado.
