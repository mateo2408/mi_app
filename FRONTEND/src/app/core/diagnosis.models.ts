export interface Disease {
    _id: string;
    name: string;
    medication: string;
    outbreakThreshold: number;
}

export interface NewDisease {
    name: string;
    medication: string;
    outbreakThreshold: number;
}

export interface OutbreakDiseaseInfo {
    id: string;
    name: string;
    medication: string;
}

export interface OutbreakAnalysis {
    isOutbreak: boolean;
    caseCount: number;
    threshold: number;
    windowDays: number;
    diseaseInfo: OutbreakDiseaseInfo | null;
    recentDiagnoses?: Array<{
        _id?: string;
        petName: string;
        diseaseId: string;
        date?: string;
    }>;
    medicationAvailability?: InventoryAvailability | null;
    alert: Alert | null;
    error?: string;
}

export interface OutbreakSummary {
    totalDiseases: number;
    analysisResults: OutbreakAnalysis[];
    activeOutbreaks: OutbreakAnalysis[];
    hasActiveOutbreaks: boolean;
}

export interface TreatmentCase {
    _id: string;
    petName: string;
    diseaseId: string;
    date: string;
}

export interface TreatmentCasesResponse {
    disease: Disease;
    cases: TreatmentCase[];
    analysis: OutbreakAnalysis;
}

export interface ApplyTreatmentRequest {
    diseaseId: string;
    petName: string;
}

export interface ApplyTreatmentResponse {
    message: string;
    treatedCase: {
        petName: string;
        diseaseId: string;
    };
    inventory: InventoryAvailability | null;
    outbreakAnalysis: OutbreakAnalysis;
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
