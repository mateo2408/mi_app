// Servicio HTTP centralizado para operaciones de negocio.
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Appointment,
  ClinicalRecord,
  DashboardSummary,
  Owner,
  Pet,
} from './models';

const apiBaseUrl = 'http://localhost:3000/api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  // Dashboard
  getSummary() {
    return this.http.get<DashboardSummary>(`${apiBaseUrl}/dashboard/summary`);
  }

  // Dueños
  listOwners() {
    return this.http.get<Owner[]>(`${apiBaseUrl}/owners`);
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
}
