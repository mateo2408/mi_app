// Script de inicializacion para MongoDB Atlas con mongosh.
// Ejecuta sobre la DB mi_veterinaria y crea estructura base para VetCore.

const dbName = 'mi_veterinaria';
const adminEmail = 'admin@vet.com';

const vetDb = db.getSiblingDB(dbName);

print(`Usando base de datos: ${dbName}`);

// Crea colecciones principales si no existen.
const requiredCollections = [
  'users',
  'owners',
  'pets',
  'appointments',
  'clinicalrecords',
  'diseases',
  'diagnoses'
];

for (const collectionName of requiredCollections) {
  const exists = vetDb.getCollectionNames().includes(collectionName);
  if (!exists) {
    vetDb.createCollection(collectionName);
    print(`Coleccion creada: ${collectionName}`);
  }
}

// Usuario admin inicial (password ya hasheado con bcrypt para Admin123*).
const adminPasswordHash = '$2b$10$tnL4R5D70mhiAYor4leOc.0f/ChVBQESHFEFiy.41rERdaai9Oyzq';
const existingAdmin = vetDb.users.findOne({ email: adminEmail });

if (!existingAdmin) {
  vetDb.users.insertOne({
    name: 'Administrador',
    email: adminEmail,
    password: adminPasswordHash,
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date()
  });
  print(`Usuario admin creado: ${adminEmail}`);
} else {
  print(`Usuario admin ya existe: ${adminEmail}`);
}

// Indices basicos.
vetDb.users.createIndex({ email: 1 }, { unique: true, name: 'uniq_email' });
vetDb.pets.createIndex({ ownerId: 1 }, { name: 'idx_pets_owner' });
vetDb.appointments.createIndex({ petId: 1, date: 1 }, { name: 'idx_appointments_pet_date' });
vetDb.clinicalrecords.createIndex({ petId: 1, date: -1 }, { name: 'idx_records_pet_date' });
vetDb.diagnoses.createIndex({ diseaseId: 1, date: -1 }, { name: 'idx_diagnoses_disease_date' });

print('Inicializacion Atlas completada correctamente.');
