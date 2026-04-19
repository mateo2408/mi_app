const fs = require('fs');

fs.writeFileSync('FRONTEND/src/app/core/diagnosis.models.ts', `export interface Disease {
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
}`);

fs.writeFileSync('FRONTEND/src/app/core/diagnosis.service.ts', `import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Disease, Diagnosis, DiagnosisResponse } from './diagnosis.models';

@Injectable({ providedIn: 'root' })
export class DiagnosisService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/diagnostics';

  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token') || '';
    return new HttpHeaders({ 'Authorization': 'Bearer ' + token });
  }

  getDiseases(): Observable<Disease[]> {
    return this.http.get<Disease[]>(this.apiUrl + '/catalog', { headers: this.getAuthHeaders() });
  }

  saveDiagnosis(data: Diagnosis): Observable<DiagnosisResponse> {
    return this.http.post<DiagnosisResponse>(this.apiUrl, data, { headers: this.getAuthHeaders() });
  }
}`);

fs.writeFileSync('FRONTEND/src/app/pages/diagnostics.component.ts', `import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiagnosisService } from '../core/diagnosis.service';
import { Disease, Diagnosis, Alert } from '../core/diagnosis.models';

@Component({
  selector: 'app-diagnostics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: \`
    <div class="p-6 bg-white rounded shadow-md max-w-2xl mx-auto mt-6">
      <h2 class="text-2xl font-bold mb-6 text-gray-800">Registrar Diagnóstico</h2>

      <div *ngIf="diagnosticAlert?.status" 
           class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 shadow-sm rounded flex items-center justify-between">
        <div>
          <strong class="font-bold text-lg">¡Alerta de Brote!</strong>
          <p class="mt-1">{{ diagnosticAlert.message }}</p>
        </div>
        <button (click)="diagnosticAlert = null" class="font-bold text-xl px-2">&times;</button>
      </div>

      <div *ngIf="successMessage" class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
        {{ successMessage }}
      </div>

      <form (ngSubmit)="onSubmit()" #diagForm="ngForm" class="space-y-4">
        <div>
          <label class="block text-gray-700 font-medium mb-1">Nombre de la Mascota</label>
          <input type="text" [(ngModel)]="diagnosis.petName" name="petName" required
                 class="w-full px-4 py-2 border rounded focus:outline-none focus:border-blue-500"
                 placeholder="Ej. Firulais">
        </div>
        <div>
          <label class="block text-gray-700 font-medium mb-1">Enfermedad (Catálogo)</label>
          <select [(ngModel)]="diagnosis.diseaseId" name="diseaseId" required
                  class="w-full px-4 py-2 border rounded focus:outline-none focus:border-blue-500 bg-white">
            <option value="" disabled>Seleccione una enfermedad</option>
            <option *ngFor="let disease of catalog" [value]="disease._id">
              {{ disease.name }}
            </option>
          </select>
        </div>
        <button type="submit" [disabled]="!diagForm.form.valid"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition cursor-pointer disabled:opacity-50">
          Guardar y Evaluar
        </button>
      </form>
    </div>
  \`
})
export class DiagnosticsComponent implements OnInit {
  private svc = inject(DiagnosisService);
  
  catalog: Disease[] = [];
  diagnosis: Diagnosis = { petName: '', diseaseId: '' };
  diagnosticAlert: Alert | null = null;
  successMessage = '';

  ngOnInit() {
    this.svc.getDiseases().subscribe({
      next: (data) => this.catalog = data,
      error: (err) => console.error(err)
    });
  }

  onSubmit() {
    this.diagnosticAlert = null;
    this.successMessage = '';
    this.svc.saveDiagnosis(this.diagnosis).subscribe({
      next: (res) => {
        if (res.alert) this.diagnosticAlert = res.alert;
        else {
          this.successMessage = 'Diagnóstico guardado correctamente.';
          setTimeout(() => this.successMessage = '', 3000);
        }
        this.diagnosis = { petName: '', diseaseId: '' };
      },
      error: (err) => console.error(err)
    });
  }
}
`);
console.log('Archivos frontend generados');
