// Script simple para sembrar paises/provincias/ciudades de ejemplo.
const { connectDatabase } = require('./config/db');
const Country = require('./models/Country');
const Province = require('./models/Province');
const City = require('./models/City');

async function seed() {
  await connectDatabase();

  await Country.deleteMany({});
  await Province.deleteMany({});
  await City.deleteMany({});

  const argentina = await Country.create({ name: 'Argentina' });
  const buenos = await Province.create({ name: 'Buenos Aires', country: argentina._id });
  await City.create({ name: 'La Plata', province: buenos._id });
  await City.create({ name: 'Mar del Plata', province: buenos._id });

  const caba = await Province.create({ name: 'CABA', country: argentina._id });
  await City.create({ name: 'Buenos Aires', province: caba._id });

  const chile = await Country.create({ name: 'Chile' });
  const santiagoProv = await Province.create({ name: 'Región Metropolitana', country: chile._id });
  await City.create({ name: 'Santiago', province: santiagoProv._id });

  console.log('Seed locations creado');
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
