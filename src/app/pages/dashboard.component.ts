// Dashboard de resumen con métricas y últimas entidades creadas.
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../core/api.service';
import { DashboardSummary } from '../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="dashboard">
      <div class="hero">
        <div>
          <p class="eyebrow">Resumen operativo</p>
          <h3>Control rápido del negocio</h3>
          <p>
            Aquí ves el estado general de la clínica: dueños, mascotas, citas y registros clínicos.
          </p>
        </div>
        <button type="button" (click)="reload()">Actualizar datos</button>
      </div>

      <div class="cards" *ngIf="summary">
        <article>
          <span>Dueños</span>
          <strong>{{ summary.counts.owners }}</strong>
        </article>
        <article>
          <span>Mascotas</span>
          <strong>{{ summary.counts.pets }}</strong>
        </article>
        <article>
          <span>Citas</span>
          <strong>{{ summary.counts.appointments }}</strong>
        </article>
        <article>
          <span>Registros</span>
          <strong>{{ summary.counts.records }}</strong>
        </article>
      </div>

      <div class="grid" *ngIf="summary">
        <section class="panel">
          <h4>Citas recientes</h4>
          <div class="item" *ngFor="let item of summary.recentAppointments">
            <div>
              <strong>{{ extractName(item.petId) }}</strong>
              <p>{{ item.reason }}</p>
            </div>
            <span>{{ item.status }}</span>
          </div>
        </section>

        <section class="panel">
          <h4>Mascotas recientes</h4>
          <div class="item" *ngFor="let item of summary.recentPets">
            <div>
              <strong>{{ item.name }}</strong>
              <p>{{ item.species }} · {{ extractOwner(item.ownerId) }}</p>
            </div>
            <span>{{ item.sex }}</span>
          </div>
        </section>
      </div>
    </section>
  `,
  styles: [
    `
      .dashboard {
        display: grid;
        gap: 24px;
      }

      .hero,
      .panel,
      .cards article {
        border: 1px solid rgba(148, 163, 184, 0.22);
        background: rgba(255, 255, 255, 0.88);
        border-radius: 24px;
        box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08);
      }

      .hero {
        padding: 28px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
      }

      .eyebrow {
        margin: 0 0 8px;
        color: #0ea5e9;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.16em;
        font-size: 0.78rem;
      }

      .hero h3 {
        margin: 0 0 10px;
        font-size: 2rem;
      }

      .hero p {
        margin: 0;
        color: #475569;
        line-height: 1.6;
        max-width: 56rem;
      }

      .hero button {
        border: 0;
        border-radius: 999px;
        padding: 12px 18px;
        color: white;
        font-weight: 800;
        background: linear-gradient(135deg, #0f172a, #2563eb);
        cursor: pointer;
      }

      .cards {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 16px;
      }

      .cards article {
        padding: 22px;
      }

      .cards span {
        display: block;
        color: #64748b;
        margin-bottom: 10px;
      }

      .cards strong {
        font-size: 2rem;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
      }

      .panel {
        padding: 22px;
      }

      .panel h4 {
        margin: 0 0 18px;
      }

      .item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 0;
        border-top: 1px solid rgba(148, 163, 184, 0.18);
      }

      .item:first-of-type {
        border-top: 0;
        padding-top: 0;
      }

      .item p {
        margin: 4px 0 0;
        color: #64748b;
      }

      .item span {
        padding: 8px 12px;
        border-radius: 999px;
        background: #dbeafe;
        color: #1d4ed8;
        font-size: 0.85rem;
        font-weight: 800;
      }

      @media (max-width: 1100px) {
        .cards,
        .grid {
          grid-template-columns: 1fr;
        }

        .hero {
          flex-direction: column;
          align-items: flex-start;
        }
      }
    `
  ]
})
export class DashboardComponent {
  private readonly apiService = inject(ApiService);

  // Se mantiene nullable para controlar carga inicial de pantalla.
  summary: DashboardSummary | null = null;

  constructor() {
    void this.reload();
  }

  async reload(): Promise<void> {
    // Consulta agregada al backend para evitar múltiples llamadas separadas.
    this.summary = await firstValueFrom(this.apiService.getSummary());
  }

  // Helpers para normalizar referencias pobladas/no pobladas en plantilla.
  extractName(value: unknown): string {
    const pet = value as { name?: string } | undefined;
    return pet?.name ?? 'Mascota';
  }

  extractOwner(value: unknown): string {
    const owner = value as { fullName?: string } | undefined;
    return owner?.fullName ?? 'Dueño';
  }
}
