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
  cedula?: string;
  country?: string;
  province?: string;
  city?: string;
  createdAt?: string;
}

export interface Country extends Identified {
  name: string;
}

export interface Province extends Identified {
  name: string;
  country: string | Country;
}

export interface City extends Identified {
  name: string;
  province: string | Province;
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

export interface InventoryItem extends Identified {
  medication: string;
  stock: number;
  minStock: number;
  unit: string;
  stockStatus: 'ok' | 'low' | 'out';
  needsRestock: boolean;
}

export interface InventorySummary {
  totalItems: number;
  totalUnits: number;
  lowStockCount: number;
  outOfStockCount: number;
  lowStockItems: InventoryItem[];
}

export interface OutbreakAlertInventory {
  medication: string;
  available: number;
  minStock: number;
  unit: string;
  status: 'ok' | 'low' | 'out' | 'missing';
  needsRestock: boolean;
}

export interface OutbreakAlert {
  type: string;
  severity: string;
  message: string;
  status: boolean;
  activeCases: number;
  threshold: number;
  diseaseName: string;
  medication: string;
  recommendation: string;
  inventory?: OutbreakAlertInventory | null;
  medications?: OutbreakAlertInventory[];
  timestamp: string;
}

export interface OutbreakMedicationStatus {
  disease: string;
  medication: string;
  available: number;
  minStock: number;
  unit: string;
  status: 'ok' | 'low' | 'out' | 'missing';
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
  activeOutbreaks?: Array<{ disease: string; cases: number; threshold: number; severity: string }>;
  diseasesAtRisk?: Array<{ disease: string; cases: number; threshold: number; percentageOfThreshold: number }>;
  epidemicSummary?: {
    totalDiseases: number;
    activeOutbreaks: number;
    diseasesAtRisk: number;
    stableDiseases: number;
    totalCasesRecorded: number;
    averageCasesPerDisease: string;
  };
  recommendations?: Array<{ priority: string; action: string }>;
  activeAlerts?: OutbreakAlert[];
  outbreakMedicationStatus?: OutbreakMedicationStatus[];
  inventorySummary: InventorySummary;
}
