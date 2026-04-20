# Checklist de Deploy en Render (VetCore)

Usa esta lista para publicar la app con MongoDB Atlas en Render sin romper la arquitectura MVC.

## 1. Preparación del repositorio

- [ ] Confirmar que el código está en GitHub y actualizado.
- [ ] Verificar que el root del proyecto en Render será `mi_app`.
- [ ] Confirmar que el archivo `render.yaml` existe y está actualizado.
- [ ] Confirmar que el build local funciona: `npm run build`.

## 2. MongoDB Atlas

- [ ] Crear/usar cluster en Atlas.
- [ ] Crear usuario de base de datos con permisos de lectura/escritura.
- [ ] Habilitar acceso de red para Render (temporalmente `0.0.0.0/0` o reglas restringidas).
- [ ] Copiar cadena de conexión `MONGODB_URI`.
- [ ] Ejecutar script de inicialización:
  - `mongosh "<MONGODB_URI>" --file scripts/atlas-init.mongosh.js`
- [ ] Validar que existan colecciones: `users`, `owners`, `pets`, `appointments`, `clinicalrecords`, `diseases`, `diagnoses`.

## 3. Backend en Render (Web Service)

- [ ] Crear servicio tipo Web Service.
- [ ] Conectar repositorio GitHub correcto.
- [ ] Configurar Root Directory: `mi_app`.
- [ ] Configurar Build Command: `npm install && npm run build`.
- [ ] Configurar Start Command: `npm run api`.
- [ ] Confirmar que `PORT` lo gestione Render automáticamente.

### Variables de entorno del backend

- [ ] `MONGODB_URI` = cadena Atlas.
- [ ] `JWT_SECRET` = secreto fuerte (mínimo 32 caracteres).
- [ ] `CORS_ORIGIN` = URL pública del frontend en Render.
- [ ] `MONGO_MAX_POOL_SIZE` = `20`.
- [ ] `MONGO_MIN_POOL_SIZE` = `2`.

## 4. Frontend en Render

### Opción A (recomendada): servir frontend desde el mismo backend

- [ ] Confirmar que Express sirve `dist/mi_app/browser`.
- [ ] Validar rutas API bajo `/api`.
- [ ] Probar navegación completa de Angular después del deploy.

### Opción B: servicio separado para frontend

- [ ] Crear Static Site o Web Service para frontend.
- [ ] Definir build del frontend (`npm run build`).
- [ ] Publicar `dist/mi_app/browser` si es Static Site.
- [ ] Asegurar que el frontend consuma el backend publicado (no localhost).
- [ ] Ajustar `CORS_ORIGIN` en backend al dominio real del frontend.

## 5. Verificación funcional post-deploy

- [ ] Endpoint de salud responde: `/api/health`.
- [ ] Login funciona con usuario admin inicial (`admin@vet.com`).
- [ ] CRUD de dueños funciona.
- [ ] CRUD de mascotas funciona.
- [ ] CRUD de citas funciona.
- [ ] CRUD de historia clínica funciona.
- [ ] Módulo de diagnósticos y alertas funciona.

## 6. Seguridad y operación

- [ ] Rotar `JWT_SECRET` por uno definitivo de producción.
- [ ] Limitar IPs en Atlas cuando termines pruebas.
- [ ] Revisar logs del servicio en Render durante primeras ejecuciones.
- [ ] Confirmar que no hay secretos comprometidos en el repositorio.
- [ ] Activar auto-deploy solo si el flujo de ramas está controlado.

## 7. Criterio de cierre

- [ ] Build exitoso en Render.
- [ ] Servicio en estado `Live`.
- [ ] Base Atlas conectada sin errores.
- [ ] Flujo completo de negocio funcionando en URL pública.
