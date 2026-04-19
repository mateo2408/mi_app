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
export interface Alert {
    message: string;
    status: boolean;
}
export interface DiagnosisResponse {
    diagnosis: Diagnosis;
    alert: Alert | null;
}