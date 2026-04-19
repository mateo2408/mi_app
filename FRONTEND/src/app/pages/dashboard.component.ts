/**
 * Dashboard moderno con notificaciones de brote e indicadores clave.
 * Diseno UX minimalista y enfocado a informacion util en un solo vistazo.
 */
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../core/api.service';
import { DashboardSummary } from '../core/models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="dashboard">
      <!-- HEADER / HERO SECTION -->
      <div class="header-banner">
        <div>
          <h2 class="text-3xl font-extrabold text-gray-800">Panel de Control General</h2>
          <p class="text-gray-500 mt-2 text-lg">Resumen global de pacientes, citas y estado operativo de la clinica.</p>
        </div>
        <div class="actions">
          <button class="btn-primary" (click)="goTo('pets')">
            <span>+</span> Paciente
          </button>
          <button class="btn-secondary" (click)="goTo('appointments')">
            <span>+</span> Nueva Cita
          </button>
        </div>
      </div>

      <div *ngIf="!summary && !errorMsg" class="loading-state">
         Cargando informacion del panel...
      </div>

      <div *ngIf="errorMsg" class="bg-red-100 text-red-700 p-4 rounded text-center">
         Error cargando el panel: {{ errorMsg }}
      </div>

      <div *ngIf="summary">
        <!-- NOTIFICATION AREA FOR OUTBREAKS (Always visible) -->
        <div class="alerts-container">
           <h3 class="font-bold text-xl text-red-700 mb-4 flex items-center">
              <span class="alert-icon">!</span> Alertas Activas de Brote
           </h3>
           <div class="alert-grid" *ngIf="summary.activeAlerts && summary.activeAlerts.length > 0; else noAlerts">
             <div *ngFor="let alert of summary.activeAlerts" class="alert-card">
               <div class="alert-header">
                 <h4>Brote: {{ alert.diseaseName }}</h4>
                 <span class="badge">{{ alert.activeCases }} casos recientes</span>
               </div>
               <p class="alert-body">Se supero el limite de {{ alert.threshold }} casos permitidos para los ultimos 60 dias.</p>
               <div class="alert-footer text-red-600 font-semibold mt-2">
                 Recomendacion: {{ alert.recommendation }}
               </div>
             </div>
           </div>
           
           <ng-template #noAlerts>
             <div class="text-green-700 bg-green-50 p-4 rounded border border-green-200 w-full font-medium">
               ✅ No existen brotes de enfermedades detectados recientemente. Todos los indicadores de epidemiologia se encuentran dentro del margen regular. No se requiere abastecimiento extraordinario.
             </div>
           </ng-template>
        </div>

        <!-- KPI CARDS -->
        <div class="kpi-grid mt-6">
          <div class="kpi-card shadow hover:shadow-lg transition">
            <div class="kpi-icon bg-blue-100 text-blue-600">D</div>
            <div>
              <p class="kpi-label">Duenos Registrados</p>
              <h3 class="kpi-value text-blue-800">{{ summary.counts.owners }}</h3>
            </div>
          </div>
          
          <div class="kpi-card shadow hover:shadow-lg transition">
            <div class="kpi-icon bg-green-100 text-green-600">M</div>
            <div>
              <p class="kpi-label">Mascotas Totales</p>
              <h3 class="kpi-value text-green-800">{{ summary.counts.pets }}</h3>
            </div>
          </div>

          <div class="kpi-card shadow hover:shadow-lg transition">
            <div class="kpi-icon bg-purple-100 text-purple-600">C</div>
            <div>
              <p class="kpi-label">Citas Generadas</p>
              <h3 class="kpi-value text-purple-800">{{ summary.counts.appointments }}</h3>
            </div>
          </div>

          <div class="kpi-card shadow hover:shadow-lg transition">
            <div class="kpi-icon bg-orange-100 text-orange-600">H</div>
            <div>
              <p class="kpi-label">Historiales Clinicos</p>
              <h3 class="kpi-value text-orange-800">{{ summary.counts.records }}</h3>
            </div>
          </div>
        </div>

        <!-- RECENT DATA PANELS -->
        <div class="data-panels mt-8">
          <div class="data-card">
            <div class="data-card-header">
               <h4>Proximas Citas</h4>
            </div>
            <div class="data-list">
              <div *ngFor="let item of summary.recentAppointments" class="data-row">
                 <div class="data-info">
                   <strong>{{ extractName(item.petId) }}</strong>
                   <p>{{ item.reason }}</p>
                 </div>
                 <span class="status-badge">{{ item.status }}</span>
              </div>
              <div *ngIf="summary.recentAppointments?.length === 0" class="text-gray-500 py-4">No hay citas recientes</div>
            </div>
          </div>

          <div class="data-card">
            <div class="data-card-header">
               <h4>Ultimos Pacientes</h4>
            </div>
            <div class="data-list">
              <div *ngFor="let item of summary.recentPets" class="data-row">
                 <div class="data-info">
                   <strong>{{ item.name }}</strong>
                   <p>{{ item.species }} | {{ extractOwner(item.ownerId) }}</p>
                 </div>
                 <span class="sex-badge">{{ item.sex }}</span>
              </div>
              <div *ngIf="summary.recentPets?.length === 0" class="text-gray-500 py-4">No hay pacientes recientes</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  `,
  styles: [`
    .dashboard { max-width: 1200px; margin: 0 auto; padding: 2rem; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; }
    .header-banner { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; background: #fff; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .actions { display: flex; gap: 1rem; }
    
    .btn-primary { background-color: #3b82f6; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; border: none; transition: background 0.2s; display: flex; align-items: center; gap: 0.5rem; }
    .btn-primary:hover { background-color: #2563eb; }
    .btn-primary span { font-size: 1.25rem; font-weight: bold; }
    
    .btn-secondary { background-color: #f3f4f6; color: #1f2937; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; border: 1px solid #e5e7eb; transition: background 0.2s; display: flex; align-items: center; gap: 0.5rem; }
    .btn-secondary:hover { background-color: #e5e7eb; }
    .btn-secondary span { font-size: 1.25rem; font-weight: bold; color: #4b5563; }
    
    .loading-state { text-align: center; padding: 4rem; color: #6b7280; font-size: 1.25rem; background: #fff; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    
    .alerts-container { background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 1rem; padding: 1.5rem; margin-bottom: 2rem; box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.1); margin-top: 0.5rem; }
    .alert-icon { display: inline-flex; align-items: center; justify-content: center; width: 1.75rem; height: 1.75rem; background: #dc2626; color: white; border-radius: 9999px; margin-right: 0.75rem; font-weight: bold; }
    .alert-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; }
    .alert-card { background: white; border-left: 4px solid #ef4444; border-radius: 0.5rem; padding: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .alert-header { display: flex; justify-content: space-between; align-items: flex-start; }
    .alert-header h4 { font-weight: 700; color: #111827; margin: 0; font-size: 1.1rem; }
    .alert-header .badge { background: #fee2e2; color: #b91c1c; padding: 0.25rem 0.5rem; border-radius: 9999px; font-size: 0.8rem; font-weight: 600; }
    .alert-body { color: #4b5563; font-size: 0.95rem; margin-top: 0.75rem; line-height: 1.4; }
    
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; }
    .kpi-card { background: #fff; border-radius: 1rem; padding: 1.5rem; display: flex; align-items: center; gap: 1.25rem; }
    .kpi-icon { width: 3.5rem; height: 3.5rem; border-radius: 1rem; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: bold; }
    .kpi-label { color: #6b7280; font-size: 0.9rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 0.25rem 0; }
    .kpi-value { font-size: 2rem; font-weight: 800; margin: 0; line-height: 1; }
    
    .data-panels { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.5rem; }
    .data-card { background: #fff; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .data-card-header { border-bottom: 1px solid #f3f4f6; padding-bottom: 1rem; margin-bottom: 1rem; }
    .data-card-header h4 { font-weight: 700; font-size: 1.25rem; color: #1f2937; margin: 0; }
    
    .data-list { display: flex; flex-direction: column; }
    .data-row { display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; border-bottom: 1px solid #f9fafb; }
    .data-row:last-child { border-bottom: none; padding-bottom: 0; }
    .data-info strong { color: #111827; font-size: 1.05rem; }
    .data-info p { color: #6b7280; font-size: 0.9rem; margin: 0.25rem 0 0 0; }
    
    .status-badge { background: #dbeafe; color: #1d4ed8; padding: 0.35rem 0.75rem; border-radius: 9999px; font-size: 0.8rem; font-weight: 600; }
    .sex-badge { background: #f3f4f6; color: #4b5563; padding: 0.35rem 0.75rem; border-radius: 9999px; font-size: 0.8rem; font-weight: 600; }
    
    @media (max-width: 768px) {
      .header-banner { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
      .actions { width: 100%; flex-wrap: wrap; }
      .btn-primary, .btn-secondary { flex: 1; justify-content: center; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  summary: any | null = null; // Typing as any allowing activeAlerts to easily mount without model changes blocking.
  errorMsg = '';

  ngOnInit(): void {
    this.reload();
  }

  async reload(): Promise<void> {
    this.errorMsg = '';
    try {
      this.summary = await firstValueFrom(this.apiService.getSummary());
      this.cdr.detectChanges(); // Forzar actualizacion
    } catch (e: any) {
      console.error('Error fetching dashboard summary:', e);
      this.errorMsg = e.message || 'Error de conexion con la API';
      this.cdr.detectChanges();
    }
  }

  goTo(path: string): void {
    // Navigates securely inside the private layout wrapper
    this.router.navigate(['/app/' + path]);
  }

  extractName(value: unknown): string {
    const pet = value as { name?: string } | undefined;
    return pet?.name ?? 'Mascota';
  }

  extractOwner(value: unknown): string {
    const owner = value as { fullName?: string } | undefined;
    return owner?.fullName ?? 'Dueno';
  }
}
