// Contratos de datos compartidos entre componentes y servicios frontend.
export interface Identified {
  _id: string;
}

export interface AuthUser extends Identified {
  fullName: string;
  email: string;
  role: 'admin' | 'recepcion' | 'veterinario';
}

export interface AuthSession {
  // JWT entregado por el backend para autorizar peticiones protegidas.
  token: string;
  user: AuthUser;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface Owner extends Identified {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  createdAt?: string;
}

export interface Pet extends Identified {
  // Referencia al dueño; puede llegar poblado como objeto o solo como id.
  ownerId: string | Owner;
  name: string;
  species: string;
  breed: string;
  sex: 'macho' | 'hembra' | 'desconocido';
  birthDate: string;
  notes: string;
  createdAt?: string;
}

export interface Appointment extends Identified {
  // Referencia a mascota; puede venir expandida por populate del backend.
  petId: string | Pet;
  veterinarianName: string;
  dateTime: string;
  reason: string;
  status: 'programada' | 'atendida' | 'cancelada';
  notes: string;
  createdAt?: string;
}

export interface ClinicalRecord extends Identified {
  // Referencia a mascota en formato id u objeto poblado.
  petId: string | Pet;
  veterinarianName: string;
  recordDate: string;
  diagnosis: string;
  treatment: string;
  notes: string;
  createdAt?: string;
}

export interface DashboardSummary {
  // Conteos agregados para tarjetas rápidas del dashboard.
  counts: {
    owners: number;
    pets: number;
    appointments: number;
    records: number;
  };
  recentAppointments: Appointment[];
  recentPets: Pet[];
}
