// Gestión del inventario de medicamentos (stock).
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../core/api.service';
import { InventoryItem } from '../core/models';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page">
      <div class="header">
        <div>
          <p class="eyebrow">Inventario</p>
          <h3>Stock disponible de medicamentos</h3>
        </div>
      </div>

      <form class="card form" [formGroup]="form" (ngSubmit)="save()">
        <input formControlName="medication" placeholder="Medicamento" />
        <input formControlName="stock" type="number" min="0" placeholder="Stock actual" />
        <input formControlName="minStock" type="number" min="0" placeholder="Stock mínimo" />
        <input formControlName="unit" placeholder="Unidad (ej. unidades, cajas)" />

        <button type="submit" [disabled]="form.invalid || loading">
          {{ editingId ? 'Actualizar' : 'Agregar' }} medicamento
        </button>
        <button type="button" class="secondary" *ngIf="editingId" (click)="resetForm()">
          Cancelar edición
        </button>
      </form>

      <section class="card list">
        <p class="status error" *ngIf="errorMessage">{{ errorMessage }}</p>
        <p class="status" *ngIf="!errorMessage && items.length === 0">No hay medicamentos registrados.</p>
        <div class="row" *ngFor="let item of items">
          <div>
            <strong>{{ item.medication }}</strong>
            <p>Stock: {{ item.stock }} {{ item.unit }} · Mínimo: {{ item.minStock }}</p>
            <small class="status-pill" [class]="statusClass(item.stockStatus)">
              {{ statusLabel(item.stockStatus) }}
            </small>
          </div>
          <button type="button" (click)="select(item)">Editar</button>
        </div>
      </section>
    </section>
  `,
  styles: [
    `
      .page {
        display: grid;
        gap: 18px;
      }

      .header h3,
      .header p {
        margin: 0;
      }

      .eyebrow {
        margin-bottom: 8px;
        color: #0ea5e9;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.16em;
        font-size: 0.78rem;
      }

      .card {
        background: rgba(255, 255, 255, 0.9);
        border: 1px solid rgba(148, 163, 184, 0.22);
        border-radius: 22px;
        box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08);
      }

      .form {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
        padding: 18px;
      }

      .form input {
        border: 1px solid #cbd5e1;
        border-radius: 14px;
        padding: 13px 14px;
      }

      .form button,
      .row button {
        border: 0;
        border-radius: 999px;
        padding: 11px 16px;
        color: white;
        font-weight: 800;
        background: linear-gradient(135deg, #0f172a, #2563eb);
        cursor: pointer;
      }

      .form button.secondary {
        background: #e2e8f0;
        color: #1e293b;
      }

      .list {
        padding: 8px 18px;
      }

      .status {
        margin: 10px 0 14px;
        color: #475569;
        font-weight: 600;
      }

      .status.error {
        color: #b91c1c;
      }

      .row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 16px 0;
        border-top: 1px solid rgba(148, 163, 184, 0.16);
      }

      .row:first-child {
        border-top: 0;
      }

      .row p,
      .row small {
        margin: 4px 0 0;
        color: #64748b;
      }

      .status-pill {
        display: inline-flex;
        padding: 4px 10px;
        border-radius: 999px;
        font-weight: 700;
        font-size: 0.75rem;
      }

      .status-pill.ok {
        background: #dcfce7;
        color: #166534;
      }

      .status-pill.low {
        background: #fef9c3;
        color: #92400e;
      }

      .status-pill.out {
        background: #fee2e2;
        color: #b91c1c;
      }

      @media (max-width: 1100px) {
        .form {
          grid-template-columns: 1fr;
        }

        .row {
          flex-direction: column;
          align-items: flex-start;
        }
      }
    `
  ]
})
export class InventoryComponent {
  private readonly fb = inject(FormBuilder);
  private readonly apiService = inject(ApiService);

  items: InventoryItem[] = [];
  loading = false;
  errorMessage = '';
  editingId: string | null = null;

  readonly form = this.fb.nonNullable.group({
    medication: ['', Validators.required],
    stock: [0, [Validators.required, Validators.min(0)]],
    minStock: [0, [Validators.required, Validators.min(0)]],
    unit: ['unidades', Validators.required]
  });

  constructor() {
    void this.reload();
  }

  async reload(): Promise<void> {
    this.errorMessage = '';
    try {
      this.items = await firstValueFrom(this.apiService.listInventory());
    } catch {
      this.items = [];
      this.errorMessage = 'No se pudo cargar el inventario. Verifica la API y tu sesión.';
    }
  }

  async save(): Promise<void> {
    if (this.form.invalid || this.loading) {
      return;
    }
    this.loading = true;
    this.errorMessage = '';

    const payload = this.form.getRawValue();
    try {
      if (this.editingId) {
        await firstValueFrom(this.apiService.updateInventoryItem(this.editingId, payload));
      } else {
        await firstValueFrom(this.apiService.createInventoryItem(payload));
      }
      await this.reload();
      this.resetForm();
    } catch (error: any) {
      this.errorMessage = error?.error?.message || 'Error guardando el inventario.';
    } finally {
      this.loading = false;
    }
  }

  select(item: InventoryItem): void {
    this.editingId = item._id;
    this.form.patchValue({
      medication: item.medication,
      stock: item.stock,
      minStock: item.minStock,
      unit: item.unit
    });
  }

  resetForm(): void {
    this.editingId = null;
    this.form.reset({
      medication: '',
      stock: 0,
      minStock: 0,
      unit: 'unidades'
    });
  }

  statusLabel(status: InventoryItem['stockStatus']): string {
    if (status === 'out') return 'Agotado';
    if (status === 'low') return 'Bajo';
    return 'Disponible';
  }

  statusClass(status: InventoryItem['stockStatus']): string {
    return status;
  }
}
