// Selecciona la base de datos de trabajo del proyecto.
db = db.getSiblingDB('mi_veterinaria');

// Crea colecciones iniciales para que la estructura exista desde el primer arranque.
db.createCollection('owners');
db.createCollection('pets');
db.createCollection('appointments');
db.createCollection('clinicalrecords');
