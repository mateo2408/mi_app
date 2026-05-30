export interface Disease {
    _id: string;
    name: string;
    medication: string;
    outbreakThreshold: number;
}
export interface Diagnosis {
    petName: string;
    diseaseId: string;
}

export interface InventoryAvailability {
    medication: string;
    available: number;
    minStock: number;
    unit: string;
    status: 'ok' | 'low' | 'out' | 'missing';
    needsRestock: boolean;
}

export interface Alert {
    message: string;
    status: boolean;
    diseaseName?: string;
    activeCases?: number;
    threshold?: number;
    recommendation?: string;
    inventory?: InventoryAvailability | null;
}
export interface DiagnosisResponse {
    diagnosis: Diagnosis;
    alert: Alert | null;
}
