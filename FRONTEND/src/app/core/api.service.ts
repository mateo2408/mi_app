// Servicio HTTP centralizado para operaciones de negocio.
// SOLID - SRP: solo comunicación HTTP con la API REST.
// Patrón Singleton: providedIn 'root' → una instancia global en Angular.
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Appointment,
  ClinicalRecord,
  DashboardSummary,
  InventoryItem,
  Owner,
  Pet,
} from './models';
import { map } from 'rxjs';
import { environment } from '../../environments/environment';

const apiBaseUrl = environment.apiBaseUrl;

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  private unwrapArrayResponse<T>(
    response: T[] | { data?: T[]; items?: T[]; results?: T[]; owners?: T[]; inventory?: T[] },
    label: string
  ): T[] {
    if (Array.isArray(response)) {
      return response;
    }

    const candidate = response.data ?? response.items ?? response.results ?? response.owners ?? response.inventory;
    if (Array.isArray(candidate)) {
      return candidate;
    }

    throw new Error(`Respuesta invalida para ${label}`);
  }

  // Dashboard
  getSummary() {
    return this.http.get<DashboardSummary>(`${apiBaseUrl}/dashboard/summary`);
  }

  // Inventario
  listInventory() {
    return this.http
      .get<InventoryItem[] | { data?: InventoryItem[]; items?: InventoryItem[]; results?: InventoryItem[] }>(
        `${apiBaseUrl}/inventory`
      )
      .pipe(map((response) => this.unwrapArrayResponse(response, 'inventario')));
  }

  createInventoryItem(payload: Partial<InventoryItem>) {
    return this.http.post<InventoryItem>(`${apiBaseUrl}/inventory`, payload);
  }

  updateInventoryItem(id: string, payload: Partial<InventoryItem>) {
    return this.http.put<InventoryItem>(`${apiBaseUrl}/inventory/${id}`, payload);
  }

  // Dueños
  listOwners() {
    return this.http
      .get<Owner[] | { data?: Owner[]; items?: Owner[]; results?: Owner[] }>(`${apiBaseUrl}/owners`)
      .pipe(map((response) => this.unwrapArrayResponse(response, 'dueños')));
  }

  createOwner(payload: Partial<Owner>) {
    return this.http.post<Owner>(`${apiBaseUrl}/owners`, payload);
  }

  deleteOwner(id: string) {
    return this.http.delete<{ message: string }>(`${apiBaseUrl}/owners/${id}`);
  }

  // Mascotas
  listPets() {
    return this.http.get<Pet[]>(`${apiBaseUrl}/pets`);
  }

  createPet(payload: Partial<Pet>) {
    return this.http.post<Pet>(`${apiBaseUrl}/pets`, payload);
  }

  deletePet(id: string) {
    return this.http.delete<{ message: string }>(`${apiBaseUrl}/pets/${id}`);
  }

  // Citas
  listAppointments() {
    return this.http.get<Appointment[]>(`${apiBaseUrl}/appointments`);
  }

  createAppointment(payload: Partial<Appointment>) {
    return this.http.post<Appointment>(`${apiBaseUrl}/appointments`, payload);
  }

  updateAppointmentStatus(id: string, status: Appointment['status']) {
    return this.http.patch<Appointment>(`${apiBaseUrl}/appointments/${id}`, { status });
  }

  deleteAppointment(id: string) {
    return this.http.delete<{ message: string }>(`${apiBaseUrl}/appointments/${id}`);
  }

  // Historia clínica
  listRecords() {
    return this.http.get<ClinicalRecord[]>(`${apiBaseUrl}/records`);
  }

  createRecord(payload: Partial<ClinicalRecord>) {
    return this.http.post<ClinicalRecord>(`${apiBaseUrl}/records`, payload);
  }

  updateRecord(id: string, payload: Partial<ClinicalRecord>) {
    return this.http.patch<ClinicalRecord>(`${apiBaseUrl}/records/${id}`, payload);
  }

  deleteRecord(id: string) {
    return this.http.delete<{ message: string }>(`${apiBaseUrl}/records/${id}`);
  }

  // Locations (countries / provinces / cities)
  listCountries() {
    return this.http.get<any[]>(`${apiBaseUrl}/locations/countries`);
  }

  listProvinces(countryId: string) {
    return this.http.get<any[]>(`${apiBaseUrl}/locations/provinces`, { params: { countryId } });
  }

  listCities(provinceId: string) {
    return this.http.get<any[]>(`${apiBaseUrl}/locations/cities`, { params: { provinceId } });
  }
}
