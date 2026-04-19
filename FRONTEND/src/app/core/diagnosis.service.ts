/**
 * Servicio Angular (Service).
 * Actua como puente entre los componentes y la API Backend.
 * Encapsula la logica HTTP para promover la reutilizacion.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Disease, Diagnosis, DiagnosisResponse } from './diagnosis.models';

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
  // URL base estandarizada del backend (express)
  private apiUrl = 'http://localhost:3000/api/diagnostics';

  /**
   * Construye los encabezados HTTP agregando el token JWT 
   * guardado en LocalStorage para validar la identidad en el backend.
   */
  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token') || '';
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
   * Envia la informacion json del diagnostico al servidor.
   * Retorna un tipado estricto { diagnosis, alert } previniendo el uso del antihypattern 'any'.
   */
  saveDiagnosis(data: Diagnosis): Observable<DiagnosisResponse> {
    return this.http.post<DiagnosisResponse>(this.apiUrl, data, { headers: this.getAuthHeaders() });
  }
}
