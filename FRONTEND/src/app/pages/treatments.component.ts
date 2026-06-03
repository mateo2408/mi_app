import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DiagnosisService } from '../core/diagnosis.service';
import {
  ApplyTreatmentResponse,
  OutbreakAnalysis,
  OutbreakSummary,
  TreatmentCase,
  TreatmentCasesResponse
} from '../core/diagnosis.models';

interface OutbreakOption {
  diseaseId: string;
  name: string;
  caseCount: number;
  threshold: number;
}

@Component({
  selector: 'app-treatments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="treatments-page">
      <header class="hero-card">
        <div>
          <p class="eyebrow">Tratamientos</p>
          <h2>Administrar brotes activos</h2>
          <p class="hero-copy">
            Selecciona un brote, revisa las mascotas registradas y aplica el tratamiento para descontar un caso y
            su inventario correspondiente.
          </p>
        </div>

        <div class="hero-stats">
          <div>
            <strong>{{ outbreakOptions.length }}</strong>
            <span>Brot(es) activos</span>
          </div>
          <div>
            <strong>{{ treatmentCases.length }}</strong>
            <span>Casos visibles</span>
          </div>
          <div>
            <strong>{{ selectedAnalysis?.caseCount || 0 }}</strong>
            <span>Casos totales</span>
          </div>
        </div>
      </header>

      <div *ngIf="successMessage" class="alert-panel alert-success">
        {{ successMessage }}
      </div>

      <div *ngIf="errorMessage" class="alert-panel alert-danger">
        <strong>Error:</strong> {{ errorMessage }}
      </div>

      <section class="panel selector-panel">
        <div class="panel-header panel-header-row">
          <div>
            <h3>Brote seleccionado</h3>
            <p>La lista muestra solo brotes detectados por el core.</p>
          </div>
          <button type="button" class="action-button secondary-button" (click)="reloadCases()">Recargar casos</button>
        </div>

        <div class="selector-grid">
          <label>
            <span class="field-label">Brote activo</span>
            <select [(ngModel)]="selectedDiseaseId" (ngModelChange)="onDiseaseChange($event)" class="field-input">
              <option value="" disabled>Selecciona un brote</option>
              <option *ngFor="let item of outbreakOptions" [value]="item.diseaseId">
                {{ item.name }} · {{ item.caseCount }} casos
              </option>
            </select>
          </label>

          <div *ngIf="selectedAnalysis" class="analysis-card">
            <strong>{{ selectedAnalysis.diseaseInfo?.name }}</strong>
            <p>{{ selectedAnalysis.caseCount }} casos registrados</p>
            <small>Umbral: {{ selectedAnalysis.threshold }} · Medicamento: {{ selectedAnalysis.diseaseInfo?.medication }}</small>
          </div>
        </div>
      </section>

      <section class="panel cases-panel">
        <div class="panel-header panel-header-row">
          <div>
            <h3>Mascotas con la enfermedad</h3>
            <p>Administrar tratamiento elimina un caso y descuenta una unidad del medicamento.</p>
          </div>
        </div>

        <div *ngIf="loadingCases" class="empty-state">Cargando casos...</div>
        <div *ngIf="!loadingCases && treatmentCases.length === 0" class="empty-state">
          Selecciona un brote activo para ver sus mascotas.
        </div>

        <div *ngIf="!loadingCases && treatmentCases.length > 0" class="case-list">
          <article class="case-row" *ngFor="let caseItem of treatmentCases">
            <div>
              <strong>{{ caseItem.petName }}</strong>
              <p>Registrado el {{ caseItem.date | date: 'mediumDate' }}</p>
            </div>
            <button type="button" class="action-button primary-button" [disabled]="applyingTreatment" (click)="applyTreatment(caseItem)">
              {{ applyingTreatment ? 'Aplicando...' : 'Administrar tratamiento' }}
            </button>
          </article>
        </div>
      </section>
    </section>
  `,
  styles: [
    `
      .treatments-page {
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
      .empty-state,
      .analysis-card p,
      .analysis-card small {
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

      .panel {
        padding: 18px;
      }

      .panel-header-row {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        align-items: center;
        margin-bottom: 16px;
      }

      .selector-grid {
        display: grid;
        grid-template-columns: minmax(260px, 360px) 1fr;
        gap: 18px;
        align-items: start;
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
        background: white;
      }

      .analysis-card {
        padding: 16px;
        border-radius: 18px;
        background: linear-gradient(180deg, rgba(14, 165, 233, 0.08), rgba(15, 23, 42, 0.02));
      }

      .analysis-card strong,
      .case-row strong {
        display: block;
        color: #0f172a;
      }

      .case-list {
        display: grid;
        gap: 12px;
      }

      .case-row {
        display: flex;
        justify-content: space-between;
        gap: 14px;
        align-items: center;
        padding: 14px 16px;
        border-radius: 18px;
        border: 1px solid rgba(148, 163, 184, 0.16);
        background: #fff;
      }

      .case-row p {
        margin: 4px 0 0;
      }

      .action-button {
        border: 0;
        border-radius: 999px;
        padding: 11px 16px;
        font-weight: 800;
        cursor: pointer;
      }

      .primary-button {
        color: white;
        background: linear-gradient(135deg, #0f172a, #2563eb);
      }

      .secondary-button {
        color: #0f172a;
        background: rgba(148, 163, 184, 0.18);
      }

      .empty-state {
        padding: 18px;
        border-radius: 16px;
        background: rgba(248, 250, 252, 0.9);
      }

      @media (max-width: 1180px) {
        .hero-card,
        .selector-grid {
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

        .panel-header-row,
        .case-row {
          flex-direction: column;
          align-items: flex-start;
        }

        .case-row button {
          width: 100%;
        }
      }
    `
  ]
})
export class TreatmentsComponent implements OnInit {
  private readonly diagnosisService = inject(DiagnosisService);

  outbreakOptions: OutbreakOption[] = [];
  selectedDiseaseId = '';
  treatmentCases: TreatmentCase[] = [];
  selectedAnalysis: OutbreakAnalysis | null = null;
  loadingCases = false;
  applyingTreatment = false;
  successMessage = '';
  errorMessage = '';

  ngOnInit(): void {
    this.reloadOutbreaks();
  }

  reloadOutbreaks(): void {
    this.diagnosisService.getOutbreakSummary().subscribe({
      next: (summary: OutbreakSummary) => {
        this.outbreakOptions = summary.analysisResults
          .filter((item) => item.isOutbreak && item.diseaseInfo)
          .map((item) => ({
            diseaseId: item.diseaseInfo!.id,
            name: item.diseaseInfo!.name,
            caseCount: item.caseCount,
            threshold: item.threshold
          }));

        if (!this.selectedDiseaseId || !this.outbreakOptions.some((item) => item.diseaseId === this.selectedDiseaseId)) {
          this.selectedDiseaseId = this.outbreakOptions[0]?.diseaseId || '';
        }

        if (this.selectedDiseaseId) {
          this.loadCases(this.selectedDiseaseId);
        } else {
          this.treatmentCases = [];
          this.selectedAnalysis = null;
        }
      },
      error: (error) => {
        console.error('No se pudieron cargar los brotes:', error);
        this.errorMessage = error?.error?.message || 'No se pudieron cargar los brotes activos.';
      }
    });
  }

  reloadCases(): void {
    if (!this.selectedDiseaseId && this.outbreakOptions.length > 0) {
      this.selectedDiseaseId = this.outbreakOptions[0].diseaseId;
    }

    if (this.selectedDiseaseId) {
      this.loadCases(this.selectedDiseaseId);
    }
  }

  onDiseaseChange(diseaseId: string): void {
    this.selectedDiseaseId = diseaseId;
    this.loadCases(diseaseId);
  }

  loadCases(diseaseId: string): void {
    if (!diseaseId) {
      this.treatmentCases = [];
      this.selectedAnalysis = null;
      return;
    }

    this.loadingCases = true;
    this.errorMessage = '';

    this.diagnosisService.getTreatmentCases(diseaseId).subscribe({
      next: (response: TreatmentCasesResponse) => {
        this.treatmentCases = response.cases;
        this.selectedAnalysis = response.analysis;
        this.selectedDiseaseId = response.disease._id;
        this.loadingCases = false;
      },
      error: (error) => {
        console.error('No se pudieron cargar los casos del brote:', error);
        this.errorMessage = error?.error?.message || 'No se pudieron cargar los casos del brote.';
        this.treatmentCases = [];
        this.selectedAnalysis = null;
        this.loadingCases = false;
      }
    });
  }

  applyTreatment(caseItem: TreatmentCase): void {
    if (!this.selectedDiseaseId) {
      this.errorMessage = 'Selecciona un brote antes de administrar tratamiento.';
      return;
    }

    this.successMessage = '';
    this.errorMessage = '';
    this.applyingTreatment = true;

    this.diagnosisService.applyTreatment({ diseaseId: this.selectedDiseaseId, petName: caseItem.petName }).subscribe({
      next: (response: ApplyTreatmentResponse) => {
        this.successMessage = `${response.message}. Se actualizo el stock y el conteo de casos.`;
        this.selectedAnalysis = response.outbreakAnalysis;
        this.reloadOutbreaks();
        setTimeout(() => (this.successMessage = ''), 3500);
        this.applyingTreatment = false;
      },
      error: (error) => {
        console.error('No se pudo administrar el tratamiento:', error);
        this.errorMessage = error?.error?.message || 'No se pudo administrar el tratamiento.';
        this.applyingTreatment = false;
      }
    });
  }
}
