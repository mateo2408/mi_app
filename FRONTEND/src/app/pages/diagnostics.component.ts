/**
 * @StudyGuide [VISTA_CONTROLADORA ANGULAR] Componente Frontend.
 * MVC - Vista interactiva que conecta con el "Core Inteligente" del backend.
 * Muestra cómo capturar datos del usuario y renderizar alertas rojas de 
 * reabastecimiento generadas por las reglas estadísticas de Node.js.
 */
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiagnosisService } from '../core/diagnosis.service';
import { Disease, Diagnosis, Alert } from '../core/diagnosis.models';

@Component({
  selector: 'app-diagnostics',
  standalone: true, // Indica que no requiere modulo
  imports: [CommonModule, FormsModule], // Importa modulos base para directivas (*ngIf, *ngFor, ngModel)
  template: `
    <div class="p-6 bg-white rounded shadow-md max-w-2xl mx-auto mt-6">
      <h2 class="text-2xl font-bold mb-6 text-gray-800">Registrar Diagnostico</h2>

      <!-- ALERTA PREVENTIVA: Se muestra solo si existe 'diagnosticAlert.status' en true -->
      <div *ngIf="diagnosticAlert?.status" 
           class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 shadow-sm rounded flex items-center justify-between">
        <div>
          <strong class="font-bold text-lg">Alerta de Brote Epidemico</strong>
          <p class="mt-1">{{ diagnosticAlert!.message }}</p>
        </div>
        <button (click)="diagnosticAlert = null" class="font-bold text-xl px-2">X</button>
      </div>

      <!-- MENSAJE DE EXITO Y ERROR -->
      <div *ngIf="successMessage" class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
        {{ successMessage }}
      </div>
      
      <div *ngIf="apiError" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
        <strong>Error:</strong> {{ apiError }}
      </div>

      <!-- FORMULARIO -->
      <form (ngSubmit)="onSubmit()" #diagForm="ngForm" class="space-y-4">
        <div>
          <label class="block text-gray-700 font-medium mb-1">Nombre de la Mascota</label>
          <!-- ngModel enlaza la variable de la clase con el campo del input (Two-Way Data Binding) -->
          <input type="text" [(ngModel)]="diagnosis.petName" name="petName" required
                 class="w-full px-4 py-2 border rounded focus:outline-none focus:border-blue-500"
                 placeholder="Ej. Max">
        </div>
        
        <div>
          <label class="block text-gray-700 font-medium mb-1">Enfermedad Detectada</label>
          <!-- Itera sobre el catalogo de enfermedades devueltas por la base de datos -->
          <select [(ngModel)]="diagnosis.diseaseId" name="diseaseId" required
                  class="w-full px-4 py-2 border rounded focus:outline-none focus:border-blue-500 bg-white">
            <option value="" disabled>Seleccione una condicion</option>
            <option *ngFor="let disease of catalog" [value]="disease._id">
              {{ disease.name }}
            </option>
          </select>
        </div>

        <button type="submit" [disabled]="!diagForm.form.valid"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition cursor-pointer disabled:opacity-50">
          Guardar y Evaluar Tendencia
        </button>
      </form>
    </div>
  `
})
export class DiagnosticsComponent implements OnInit {
  // Inyeccion de dependencias (Angular 14+ usando la funcion inject)
  private svc = inject(DiagnosisService);
  
  // Variables de estado del componente (Fuertemente tipadas)
  catalog: Disease[] = [];
  diagnosis: Diagnosis = { petName: '', diseaseId: '' };
  diagnosticAlert: Alert | null = null;
  successMessage = '';
  apiError = '';

  /**
   * Metodo del ciclo de vida (Lifecycle hook).
   * Se ejecuta una vez cuando el componente se inicializa en el DOM.
   */
  ngOnInit() {
    // Suscripcion al observable para cargar el catalogo
    this.svc.getDiseases().subscribe({
      next: (data) => this.catalog = data,
      error: (err) => console.error('Fallo la carga del catalogo:', err)
    });
  }

  /**
   * Manejador asincrono reactivo del envio del formulario.
   */
  onSubmit() {
    this.diagnosticAlert = null;
    this.successMessage = '';
    this.apiError = ''; // Limpiar errores anteriores

    // Validacion adicional para prevenir envios con ENTER si el formulario esta incompleto
    if (!this.diagnosis.petName || !this.diagnosis.diseaseId) {
      this.apiError = 'Por favor complete todos los campos (nombre de la mascota y la enfermedad) antes de guardar.';
      return;
    }
    
    // Llamada al servicio HTTP (API Backend Node.js)
    this.svc.saveDiagnosis(this.diagnosis).subscribe({
      next: (res) => {
        // Logica condicional: Despliega la UI de Prevencion (Alerta de Abastecimiento)
        if (res.alert) {
            this.diagnosticAlert = res.alert;
        } else {
          this.successMessage = 'El diagnostico fue guardado en el historial.';
          setTimeout(() => this.successMessage = '', 3000); // Limpia el mensaje despues de 3 segundos
        }
        // Reseteo bidireccional del formulario
        this.diagnosis = { petName: '', diseaseId: '' };
      },
      error: (err) => {
        console.error('Error al intentar guardar el diagnostico:', err);
        // Exponemos el error del backend para que el usuario sepa que paso
        this.apiError = err.error?.message || 'Error interno del servidor. Revisa que los datos sean correctos.';
      }
    });
  }
}
