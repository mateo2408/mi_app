# Imagen base oficial de MongoDB para desarrollo.
FROM mongo:7

# Script ejecutado una sola vez al inicializar el volumen vacío.
COPY docker/mongo-init.js /docker-entrypoint-initdb.d/01-init.js
