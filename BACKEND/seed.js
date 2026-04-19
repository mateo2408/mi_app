// Seed inicial para ambiente local de desarrollo/demos.
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Owner = require('./models/Owner');
const Pet = require('./models/Pet');
const Appointment = require('./models/Appointment');
const ClinicalRecord = require('./models/ClinicalRecord');

async function seedDatabase() {
  // Previene duplicar datos semilla en cada reinicio.
  const userCount = await User.countDocuments();

  if (userCount > 0) {
    return;
  }

  // Se hashea la contraseña una única vez para todos los usuarios de ejemplo.
  const defaultPassword = await bcrypt.hash('Admin123*', 10);

  // Crea usuario admin, recepción y veterinario.
  const [, , vetUser] = await User.create([
    {
      fullName: 'Administrador general',
      email: 'admin@vet.com',
      passwordHash: defaultPassword,
      role: 'admin'
    },
    {
      fullName: 'Recepción principal',
      email: 'recepcion@vet.com',
      passwordHash: defaultPassword,
      role: 'recepcion'
    },
    {
      fullName: 'Dra. Laura Pérez',
      email: 'vet@vet.com',
      passwordHash: defaultPassword,
      role: 'veterinario'
    }
  ]);

  // Entidades de negocio mínimas para probar flujo completo.
  const owner = await Owner.create({
    fullName: 'Ana Gómez',
    phone: '3001234567',
    email: 'ana.gomez@email.com',
    address: 'Calle 12 # 34-56'
  });

  const pet = await Pet.create({
    ownerId: owner._id,
    name: 'Luna',
    species: 'Perro',
    breed: 'Labrador',
    sex: 'hembra',
    birthDate: '2021-08-15',
    notes: 'Paciente tranquila y sin alergias conocidas.'
  });

  const appointment = await Appointment.create({
    petId: pet._id,
    veterinarianName: vetUser.fullName,
    dateTime: new Date(),
    reason: 'Control general',
    status: 'programada',
    notes: 'Primera consulta del sistema.'
  });

  await ClinicalRecord.create({
    petId: pet._id,
    veterinarianName: vetUser.fullName,
    recordDate: new Date(),
    diagnosis: 'Paciente sano',
    treatment: 'Revisión preventiva y control anual.',
    notes: `Registro inicial creado para ${appointment._id}`
  });
}

module.exports = { seedDatabase };
