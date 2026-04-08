// Historia clínica: registro y consulta de atenciones médicas.
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../core/api.service';
import { ClinicalRecord, Pet } from '../core/models';

@Component({
  selector: 'app-records',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page">
      <div class="header">
        <div>
          <p class="eyebrow">Historia clínica</p>
          <h3>Registros médicos de las mascotas</h3>
        </div>
      </div>

      <form class="card form" [formGroup]="form" (ngSubmit)="save()">
        <select formControlName="petId">
          <option value="">Selecciona una mascota</option>
          <option *ngFor="let pet of pets" [value]="pet._id">{{ pet.name }}</option>
        </select>
        <input formControlName="veterinarianName" placeholder="Veterinario" />
        <input formControlName="recordDate" type="date" />
        <input formControlName="diagnosis" placeholder="Diagnóstico" />
        <input formControlName="treatment" placeholder="Tratamiento" />
        <input class="wide" formControlName="notes" placeholder="Observaciones" />
        <button type="submit" [disabled]="form.invalid || loading">
          {{ editingId ? 'Actualizar registro' : 'Guardar registro' }}
        </button>
        <button type="button" *ngIf="editingId" (click)="cancelEdit()">Cancelar edición</button>
      </form>

      <section class="card list">
        <div class="row" *ngFor="let record of records">
          <div>
            <strong>{{ extractPet(record.petId) }}</strong>
            <p>
              {{ record.veterinarianName }} · {{ record.recordDate | date: 'mediumDate' }}
            </p>
            <small>{{ record.diagnosis }} · {{ record.treatment }}</small>
          </div>
          <div class="actions">
            <button type="button" (click)="startEdit(record)">Editar</button>
            <button type="button" (click)="remove(record._id)">Eliminar</button>
          </div>
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

      .wide {
        grid-column: 1 / -2;
      }

      .form input,
      .form select {
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

      .list {
        padding: 8px 18px;
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

      .actions {
        display: flex;
        gap: 10px;
      }

      @media (max-width: 1100px) {
        .form {
          grid-template-columns: 1fr;
        }

        .wide {
          grid-column: auto;
        }

        .row {
          flex-direction: column;
          align-items: flex-start;
        }
      }
    `
  ]
})
export class RecordsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly apiService = inject(ApiService);

  // Catálogo de mascotas + registros mostrados en pantalla.
  pets: Pet[] = [];
  records: ClinicalRecord[] = [];
  loading = false;
  editingId: string | null = null;

  // Formulario de alta de registro clínico.
  readonly form = this.fb.nonNullable.group({
    petId: ['', Validators.required],
    veterinarianName: ['Dra. Laura Pérez', Validators.required],
    recordDate: [new Date().toISOString().slice(0, 10), Validators.required],
    diagnosis: ['', Validators.required],
    treatment: ['', Validators.required],
    notes: ['']
  });

  constructor() {
    void this.reload();
  }

  async reload(): Promise<void> {
    // Consulta paralela para mejorar tiempos de carga inicial.
    const [pets, records] = await Promise.all([
      firstValueFrom(this.apiService.listPets()),
      firstValueFrom(this.apiService.listRecords())
    ]);

    this.pets = pets;
    this.records = records;

    // Si hay mascotas, preselecciona una para facilitar registro rápido.
    if (!this.form.controls.petId.value && this.pets.length > 0) {
      this.form.controls.petId.setValue(this.pets[0]._id);
    }
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    try {
      if (this.editingId) {
        await firstValueFrom(this.apiService.updateRecord(this.editingId, this.form.getRawValue()));
      } else {
        // Inserta registro y actualiza lista local.
        await firstValueFrom(this.apiService.createRecord(this.form.getRawValue()));
      }

      await this.reload();
      this.editingId = null;
      this.form.patchValue({ diagnosis: '', treatment: '', notes: '' });
    } finally {
      this.loading = false;
    }
  }

  startEdit(record: ClinicalRecord): void {
    this.editingId = record._id;
    this.form.patchValue({
      petId: this.extractPetId(record.petId),
      veterinarianName: record.veterinarianName,
      recordDate: this.toDateInput(record.recordDate),
      diagnosis: record.diagnosis,
      treatment: record.treatment,
      notes: record.notes ?? ''
    });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.form.patchValue({ diagnosis: '', treatment: '', notes: '' });
  }

  async remove(id: string): Promise<void> {
    await firstValueFrom(this.apiService.deleteRecord(id));
    this.records = this.records.filter((record) => record._id !== id);
  }

  // Normaliza petId cuando backend devuelve populate en vez de id simple.
  extractPet(value: unknown): string {
    const pet = value as { name?: string } | undefined;
    return pet?.name ?? 'Mascota';
  }

  private extractPetId(value: string | Pet): string {
    return typeof value === 'string' ? value : value._id;
  }

  private toDateInput(value: string): string {
    // Normaliza a YYYY-MM-DD para el control date.
    return value.slice(0, 10);
  }
}
