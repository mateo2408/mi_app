import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DiagnosisService } from '../core/diagnosis.service';
import {
  Alert,
  Disease,
  Diagnosis,
  NewDisease,
  OutbreakSummary
} from '../core/diagnosis.models';
import { Pet } from '../core/models';

interface ChartItem {
  name: string;
  caseCount: number;
  threshold: number;
  isOutbreak: boolean;
  width: number;
}

@Component({
  selector: 'app-diagnostics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="diagnostics-page">
      <header class="hero-card">
        <div>
          <p class="eyebrow">Diagnosticos</p>
          <h2>Control de brotes en tiempo real</h2>
          <p class="hero-copy">
            Selecciona una mascota del sistema, registra el diagnostico y observa como cambia el grafico de casos por
            enfermedad.
          </p>
        </div>

        <div class="hero-stats">
          <div>
            <strong>{{ pets.length }}</strong>
            <span>Mascotas</span>
          </div>
          <div>
            <strong>{{ catalog.length }}</strong>
            <span>Enfermedades</span>
          </div>
          <div>
            <strong>{{ activeOutbreaksCount }}</strong>
            <span>Brot(es) activos</span>
          </div>
        </div>
      </header>

      <div *ngIf="diagnosticAlert?.status" class="alert-panel alert-danger">
        <div>
          <strong class="alert-title">Alerta de Brote Epidemico</strong>
          <p>{{ diagnosticAlert!.message }}</p>
          <p *ngIf="diagnosticAlert?.inventory" class="alert-inventory">
            Stock disponible: {{ diagnosticAlert?.inventory?.available }} {{ diagnosticAlert?.inventory?.unit }}
            ({{ inventoryLabel(diagnosticAlert?.inventory?.status || 'missing') }})
          </p>
        </div>
        <button type="button" class="close-button" (click)="diagnosticAlert = null">x</button>
      </div>

      <div *ngIf="successMessage" class="alert-panel alert-success">
        {{ successMessage }}
      </div>

      <div *ngIf="apiError" class="alert-panel alert-danger">
        <strong>Error:</strong> {{ apiError }}
      </div>

      <section class="workspace-grid">
        <article class="panel">
          <div class="panel-header">
            <h3>Registrar Diagnostico</h3>
            <p>La mascota se selecciona desde el catalogo de pacientes.</p>
          </div>

          <form (ngSubmit)="onSubmit()" #diagForm="ngForm" class="space-y-4">
            <div>
              <label class="field-label">Mascota</label>
              <select
                [(ngModel)]="selectedPetId"
                name="selectedPetId"
                required
                (ngModelChange)="syncSelectedPet()"
                class="field-input bg-white"
              >
                <option value="" disabled>Seleccione una mascota</option>
                <option *ngFor="let pet of pets" [value]="pet._id">{{ pet.name }} - {{ pet.species }}</option>
              </select>
              <small class="field-hint">Se registrara como: {{ diagnosis.petName || 'sin seleccionar' }}</small>
            </div>

            <div>
              <label class="field-label">Enfermedad Detectada</label>
              <select [(ngModel)]="diagnosis.diseaseId" name="diseaseId" required class="field-input bg-white">
                <option value="" disabled>Seleccione una condicion</option>
                <option *ngFor="let disease of catalog" [value]="disease._id">{{ disease.name }}</option>
              </select>
            </div>

            <button type="submit" [disabled]="!diagForm.form.valid || !selectedPetId" class="action-button primary-button">
              Guardar y actualizar grafico
            </button>
          </form>
        </article>

        <article class="panel chart-panel">
          <div class="panel-header panel-header-row">
            <div>
              <h3>Casos por enfermedad</h3>
              <p>Se actualiza al registrar un diagnostico o al crear una enfermedad nueva.</p>
            </div>
            <button type="button" class="action-button secondary-button" (click)="reloadAllData()">Actualizar</button>
          </div>

          <div *ngIf="chartItems.length; else emptyChart" class="chart-list">
            <div *ngFor="let item of chartItems" class="chart-row">
              <div class="chart-meta">
                <strong>{{ item.name }}</strong>
                <span>{{ item.caseCount }} casos | umbral {{ item.threshold }}</span>
              </div>
              <div class="chart-track">
                <div class="chart-bar" [class.chart-bar-alert]="item.isOutbreak" [style.width.%]="item.width"></div>
              </div>
              <div class="chart-tag" [class.chart-tag-alert]="item.isOutbreak">
                {{ item.isOutbreak ? 'Brote activo' : 'Bajo control' }}
              </div>
            </div>
          </div>

          <ng-template #emptyChart>
            <div class="empty-state">Todavia no hay enfermedades para graficar.</div>
          </ng-template>
        </article>

        <article class="panel disease-panel">
          <div class="panel-header">
            <h3>Nueva enfermedad</h3>
            <p>Agrega el catalogo y el grafico la considerara de inmediato.</p>
          </div>

          <form (ngSubmit)="onCreateDisease()" #diseaseForm="ngForm" class="space-y-4">
            <div>
              <label class="field-label">Nombre</label>
              <input
                type="text"
                [(ngModel)]="newDisease.name"
                name="diseaseName"
                required
                class="field-input"
                placeholder="Ej. Parvovirus Canino"
              />
            </div>

            <div>
              <label class="field-label">Medicamento</label>
              <input
                type="text"
                [(ngModel)]="newDisease.medication"
                name="medication"
                required
                class="field-input"
                placeholder="Ej. Suero Fisiologico y Antibiotico"
              />
            </div>

            <div>
              <label class="field-label">Umbral de brote</label>
              <input
                type="number"
                [(ngModel)]="newDisease.outbreakThreshold"
                name="outbreakThreshold"
                min="1"
                required
                class="field-input"
                placeholder="6"
              />
            </div>

            <button type="submit" [disabled]="!diseaseForm.form.valid" class="action-button primary-button">
              Agregar enfermedad
            </button>
          </form>
        </article>
      </section>

    </section>
  `,
  styles: [
    `
      .diagnostics-page {
        display: grid;
        gap: 18px;
      }

      .hero-card,
      .panel,
      .alert-panel {
        background: rgba(255, 255, 255, 0.95);
        border: 1px solid rgba(148, 163, 184, 0.18);
        border-radius: 24px;
        box-shadow: 0 24px 70px rgba(15, 23, 42, 0.08);
      }

      .hero-card {
        display: flex;
        justify-content: space-between;
        gap: 18px;
        padding: 24px;
        align-items: end;
      }

      .eyebrow {
        margin: 0 0 8px;
        text-transform: uppercase;
        letter-spacing: 0.16em;
        font-size: 0.78rem;
        font-weight: 800;
        color: #0f766e;
      }

      .hero-card h2,
      .panel-header h3 {
        margin: 0;
      }

      .hero-copy,
      .panel-header p,
      .field-hint,
      .empty-state {
        color: #64748b;
      }

      .hero-stats {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
        min-width: min(100%, 360px);
      }

      .hero-stats div {
        padding: 14px 16px;
        border-radius: 18px;
        background: linear-gradient(180deg, rgba(14, 165, 233, 0.08), rgba(15, 23, 42, 0.02));
      }

      .hero-stats strong {
        display: block;
        font-size: 1.5rem;
      }

      .hero-stats span {
        color: #64748b;
        font-size: 0.88rem;
      }

      .alert-panel {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        align-items: start;
        padding: 16px 18px;
      }

      .alert-title {
        display: block;
        font-size: 1.05rem;
      }

      .alert-danger {
        border-left: 5px solid #ef4444;
        color: #991b1b;
        background: linear-gradient(180deg, rgba(254, 226, 226, 0.9), rgba(255, 255, 255, 0.96));
      }

      .alert-success {
        border-left: 5px solid #10b981;
        color: #065f46;
        background: linear-gradient(180deg, rgba(220, 252, 231, 0.9), rgba(255, 255, 255, 0.96));
      }

      .workspace-grid {
        display: grid;
        grid-template-columns: 1.05fr 1.4fr;
        gap: 18px;
      }

      .panel {
        padding: 18px;
      }

      .panel-header {
        margin-bottom: 16px;
      }

      .panel-header-row {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        align-items: center;
      }

      .field-label {
        display: block;
        margin-bottom: 6px;
        font-weight: 700;
        color: #1e293b;
      }

      .field-input {
        width: 100%;
        border: 1px solid #cbd5e1;
        border-radius: 14px;
        padding: 12px 14px;
        outline: none;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
      }

      .field-input:focus {
        border-color: #0ea5e9;
        box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.14);
      }

      .action-button {
        border: 0;
        border-radius: 999px;
        padding: 11px 16px;
        font-weight: 800;
        cursor: pointer;
      }

      .primary-button {
        width: 100%;
        color: white;
        background: linear-gradient(135deg, #0f172a, #2563eb);
      }

      .secondary-button {
        color: #0f172a;
        background: rgba(148, 163, 184, 0.18);
      }

      .chart-list {
        display: grid;
        gap: 14px;
      }

      .chart-row {
        display: grid;
        gap: 8px;
      }

      .chart-meta {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        color: #0f172a;
      }

      .chart-meta span {
        color: #64748b;
      }

      .chart-track {
        height: 14px;
        border-radius: 999px;
        background: #e2e8f0;
        overflow: hidden;
      }

      .chart-bar {
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(135deg, #38bdf8, #2563eb);
      }

      .chart-bar-alert {
        background: linear-gradient(135deg, #fb7185, #dc2626);
      }

      .chart-tag {
        justify-self: start;
        padding: 4px 10px;
        border-radius: 999px;
        background: rgba(14, 165, 233, 0.12);
        color: #0369a1;
        font-size: 0.8rem;
        font-weight: 700;
      }

      .chart-tag-alert {
        background: rgba(239, 68, 68, 0.12);
        color: #b91c1c;
      }

      .empty-state {
        padding: 18px;
        border-radius: 16px;
        background: rgba(248, 250, 252, 0.9);
      }

      @media (max-width: 1180px) {
        .workspace-grid {
          grid-template-columns: 1fr;
        }

        .hero-card {
          flex-direction: column;
          align-items: stretch;
        }

        .hero-stats {
          min-width: 0;
        }
      }

      @media (max-width: 720px) {
        .hero-stats {
          grid-template-columns: 1fr;
        }

        .chart-meta,
        .panel-header-row {
          flex-direction: column;
          align-items: flex-start;
        }
      }
    `
  ]
})
export class DiagnosticsComponent implements OnInit {
  private svc = inject(DiagnosisService);

  pets: Pet[] = [];
  catalog: Disease[] = [];
  chartItems: ChartItem[] = [];
  diagnosis: Diagnosis = { petName: '', diseaseId: '' };
  selectedPetId = '';
  newDisease: NewDisease = { name: '', medication: '', outbreakThreshold: 6 };
  diagnosticAlert: Alert | null = null;
  successMessage = '';
  apiError = '';

  ngOnInit() {
    this.reloadAllData();
  }

  reloadAllData() {
    this.svc.getPets().subscribe({
      next: (data) => {
        this.pets = data;
        if (!this.selectedPetId && this.pets.length > 0) {
          this.selectedPetId = this.pets[0]._id;
          this.syncSelectedPet();
        }
      },
      error: (err) => console.error('Fallo la carga de mascotas:', err)
    });

    this.svc.getDiseases().subscribe({
      next: (data) => {
        this.catalog = data;
        if (!this.diagnosis.diseaseId && this.catalog.length > 0) {
          this.diagnosis.diseaseId = this.catalog[0]._id;
        }
      },
      error: (err) => console.error('Fallo la carga del catalogo:', err)
    });

    this.svc.getOutbreakSummary().subscribe({
      next: (data) => {
        this.chartItems = this.buildChartItems(data);
      },
      error: (err) => console.error('Fallo la carga del grafico:', err)
    });
  }

  syncSelectedPet() {
    const selectedPet = this.pets.find((pet) => pet._id === this.selectedPetId);
    this.diagnosis.petName = selectedPet?.name || '';
  }

  buildChartItems(summary: OutbreakSummary): ChartItem[] {
    const sortedResults = [...summary.analysisResults].sort((first, second) => {
      const caseDifference = second.caseCount - first.caseCount;
      if (caseDifference !== 0) {
        return caseDifference;
      }

      return (first.diseaseInfo?.name || '').localeCompare(second.diseaseInfo?.name || '');
    });

    const maxCases = Math.max(...sortedResults.map((item) => item.caseCount), 1);

    return sortedResults.map((item) => ({
      name: item.diseaseInfo?.name || 'Enfermedad sin nombre',
      caseCount: item.caseCount,
      threshold: item.threshold,
      isOutbreak: item.isOutbreak,
      width: maxCases > 0 ? Math.max(6, (item.caseCount / maxCases) * 100) : 0
    }));
  }

  get activeOutbreaksCount(): number {
    return this.chartItems.filter((item) => item.isOutbreak).length;
  }

  onSubmit() {
    this.diagnosticAlert = null;
    this.successMessage = '';
    this.apiError = '';

    if (!this.selectedPetId || !this.diagnosis.petName || !this.diagnosis.diseaseId) {
      this.apiError = 'Por favor seleccione una mascota y una enfermedad antes de guardar.';
      return;
    }

    this.svc.saveDiagnosis(this.diagnosis).subscribe({
      next: (res) => {
        if (res.alert) {
          this.diagnosticAlert = res.alert;
        } else {
          this.successMessage = 'El diagnostico fue guardado en el historial.';
          setTimeout(() => (this.successMessage = ''), 3000);
        }

        this.reloadAllData();
      },
      error: (err) => {
        console.error('Error al intentar guardar el diagnostico:', err);
        this.apiError = err.error?.message || 'Error interno del servidor. Revisa que los datos sean correctos.';
      }
    });
  }

  onCreateDisease() {
    this.diagnosticAlert = null;
    this.successMessage = '';
    this.apiError = '';

    const payload: NewDisease = {
      name: this.newDisease.name.trim(),
      medication: this.newDisease.medication.trim(),
      outbreakThreshold: Number(this.newDisease.outbreakThreshold) || 6
    };

    if (!payload.name || !payload.medication) {
      this.apiError = 'El nombre y el medicamento de la enfermedad son obligatorios.';
      return;
    }

    this.svc.createDisease(payload).subscribe({
      next: () => {
        this.successMessage = 'La enfermedad fue agregada al catalogo.';
        this.newDisease = { name: '', medication: '', outbreakThreshold: 6 };
        this.reloadAllData();
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: (err) => {
        console.error('Error al crear la enfermedad:', err);
        this.apiError = err.error?.message || 'No se pudo crear la enfermedad.';
      }
    });
  }

  inventoryLabel(status: string): string {
    if (status === 'out') return 'Agotado';
    if (status === 'low') return 'Bajo';
    if (status === 'missing') return 'Sin registro';
    return 'Disponible';
  }
}
