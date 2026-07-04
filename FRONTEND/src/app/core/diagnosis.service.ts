import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ApplyTreatmentRequest,
  ApplyTreatmentResponse,
  Disease,
  Diagnosis,
  DiagnosisResponse,
  NewDisease,
  RecentDiagnosis,
  OutbreakSummary,
  TreatmentCasesResponse
} from './diagnosis.models';
import { environment } from '../../environments/environment';
import { InventoryItem, Pet } from './models';
import { API_CLIENT } from './api-client';
import { DiagnosticsEndpointFactory } from './diagnostics-endpoints.factory';

@Injectable({
  providedIn: 'root'
})
export class DiagnosisService {
  private readonly apiClient = inject(API_CLIENT);
  private readonly endpoints = DiagnosticsEndpointFactory.create(environment.apiBaseUrl);

  getDiseases(): Observable<Disease[]> {
    return this.apiClient.get<Disease[]>(this.endpoints.catalog);
  }

  getPets(): Observable<Pet[]> {
    return this.apiClient.get<Pet[]>(this.endpoints.pets);
  }

  getInventory(): Observable<InventoryItem[]> {
    return this.apiClient.get<InventoryItem[]>(this.endpoints.inventory);
  }

  createDisease(data: NewDisease): Observable<Disease> {
    return this.apiClient.post<Disease>(this.endpoints.createDisease, data);
  }

  getOutbreakSummary(): Observable<OutbreakSummary> {
    return this.apiClient.get<OutbreakSummary>(this.endpoints.outbreakSummary);
  }

  getTreatmentCases(diseaseId: string): Observable<TreatmentCasesResponse> {
    return this.apiClient.get<TreatmentCasesResponse>(this.endpoints.treatmentCases(diseaseId));
  }

  applyTreatment(payload: ApplyTreatmentRequest): Observable<ApplyTreatmentResponse> {
    return this.apiClient.post<ApplyTreatmentResponse>(this.endpoints.applyTreatment, payload);
  }

  saveDiagnosis(data: Diagnosis): Observable<DiagnosisResponse> {
    return this.apiClient.post<DiagnosisResponse>(this.endpoints.createDiagnosis, data);
  }

  getRecentDiagnoses(days = 30, limit = 10): Observable<{ days: number; limit: number; recentDiagnoses: RecentDiagnosis[] }> {
    return this.apiClient.get<{ days: number; limit: number; recentDiagnoses: RecentDiagnosis[] }>(
      this.endpoints.recentDiagnoses(days, limit)
    );
  }
}
