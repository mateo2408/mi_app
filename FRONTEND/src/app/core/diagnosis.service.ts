/**
 * Servicio Angular (Service).
 * Actua como puente entre los componentes y la API Backend.
 * Encapsula la logica HTTP para promover la reutilizacion.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ApplyTreatmentRequest,
  ApplyTreatmentResponse,
  Disease,
  Diagnosis,
  DiagnosisResponse,
  NewDisease,
  OutbreakSummary,
  TreatmentCasesResponse
} from './diagnosis.models';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { InventoryItem, Pet } from './models';

/**
 * El decorador @Injectable permite que esta clase sea inyectada
 * en otros componentes. 'providedIn: root' crea un patron Singleton (una sola instancia).
 */
@Injectable({
  providedIn: 'root'
})
export class DiagnosisService {
  // Cliente HTTP integrado en Angular
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  // URL base estandarizada del backend (express)
  private apiUrl = `${environment.apiBaseUrl}/diagnostics`;

  /**
   * Construye los encabezados HTTP agregando el token JWT 
   * guardado en LocalStorage para validar la identidad en el backend.
   */
  private getAuthHeaders() {
    const token = this.authService.getToken() || '';
    return new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });
  }

  /**
   * Obtiene el listado iterativo de enfermedades disponibles.
   * Retorna un Observable tipado como un arreglo de Disease [].
   */
  getDiseases(): Observable<Disease[]> {
    return this.http.get<Disease[]>(this.apiUrl + '/catalog', { headers: this.getAuthHeaders() });
  }

  /**
   * Obtiene el listado de mascotas disponibles para seleccionar en el diagnostico.
   */
  getPets(): Observable<Pet[]> {
    return this.http.get<Pet[]>(`${environment.apiBaseUrl}/pets`, { headers: this.getAuthHeaders() });
  }

  /**
   * Obtiene el inventario actual para que otros formularios reutilicen los medicamentos existentes.
   */
  getInventory(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(`${environment.apiBaseUrl}/inventory`, { headers: this.getAuthHeaders() });
  }

  /**
   * Registra una nueva enfermedad en el catalogo.
   */
  createDisease(data: NewDisease): Observable<Disease> {
    return this.http.post<Disease>(this.apiUrl + '/catalog', data, { headers: this.getAuthHeaders() });
  }

  /**
   * Obtiene el resumen epidemiologico para dibujar el grafico en vivo.
   */
  getOutbreakSummary(): Observable<OutbreakSummary> {
    return this.http.get<OutbreakSummary>(this.apiUrl + '/analyze/all', { headers: this.getAuthHeaders() });
  }

  /**
   * Obtiene las mascotas con casos activos de una enfermedad/brote.
   */
  getTreatmentCases(diseaseId: string): Observable<TreatmentCasesResponse> {
    return this.http.get<TreatmentCasesResponse>(`${this.apiUrl}/treatment/${diseaseId}/cases`, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Aplica un tratamiento y descuenta el medicamento del inventario.
   */
  applyTreatment(payload: ApplyTreatmentRequest): Observable<ApplyTreatmentResponse> {
    return this.http.post<ApplyTreatmentResponse>(`${this.apiUrl}/treatment/apply`, payload, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Envia la informacion json del diagnostico al servidor.
   * Retorna un tipado estricto { diagnosis, alert } previniendo el uso del antihypattern 'any'.
   */
  saveDiagnosis(data: Diagnosis): Observable<DiagnosisResponse> {
    return this.http.post<DiagnosisResponse>(this.apiUrl, data, { headers: this.getAuthHeaders() });
  }
}
