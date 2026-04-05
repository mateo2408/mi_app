// Gestión de mascotas vinculadas a dueños.
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../core/api.service';
import { Owner, Pet } from '../core/models';

@Component({
  selector: 'app-pets',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page">
      <div class="header">
        <div>
          <p class="eyebrow">Mascotas</p>
          <h3>Fichas básicas de los pacientes</h3>
        </div>
      </div>

      <form class="card form" [formGroup]="form" (ngSubmit)="save()">
        <select formControlName="ownerId">
          <option value="">Selecciona un dueño</option>
          <option *ngFor="let owner of owners" [value]="owner._id">{{ owner.fullName }}</option>
        </select>
        <input formControlName="name" placeholder="Nombre de la mascota" />
        <input formControlName="species" placeholder="Especie" />
        <input formControlName="breed" placeholder="Raza" />
        <select formControlName="sex">
          <option value="desconocido">Desconocido</option>
          <option value="macho">Macho</option>
          <option value="hembra">Hembra</option>
        </select>
        <input formControlName="birthDate" type="date" />
        <input class="wide" formControlName="notes" placeholder="Notas clínicas" />
        <button type="submit" [disabled]="form.invalid || loading">Agregar mascota</button>
      </form>

      <section class="card list">
        <div class="row" *ngFor="let pet of pets">
          <div>
            <strong>{{ pet.name }}</strong>
            <p>
              {{ pet.species }} · {{ pet.breed }} · {{ pet.sex }} ·
              {{ extractOwner(pet.ownerId) }}
            </p>
            <small>{{ pet.notes }}</small>
          </div>
          <button type="button" (click)="remove(pet._id)">Eliminar</button>
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
export class PetsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly apiService = inject(ApiService);

  // Catálogo de dueños para selector + colección de mascotas renderizadas.
  owners: Owner[] = [];
  pets: Pet[] = [];
  loading = false;

  // Formulario de alta de mascota.
  readonly form = this.fb.nonNullable.group({
    ownerId: ['', Validators.required],
    name: ['', Validators.required],
    species: ['', Validators.required],
    breed: [''],
    sex: ['desconocido' as Pet['sex'], Validators.required],
    birthDate: [''],
    notes: ['']
  });

  constructor() {
    void this.reload();
  }

  async reload(): Promise<void> {
    // Carga en paralelo para acelerar tiempo de pantalla.
    const [owners, pets] = await Promise.all([
      firstValueFrom(this.apiService.listOwners()),
      firstValueFrom(this.apiService.listPets())
    ]);

    this.owners = owners;
    this.pets = pets;

    // Preselección del primer dueño para facilitar carga de datos.
    if (!this.form.controls.ownerId.value && this.owners.length > 0) {
      this.form.controls.ownerId.setValue(this.owners[0]._id);
    }
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    try {
      // Crea mascota y la inyecta al inicio de la lista visible.
      const pet = await firstValueFrom(this.apiService.createPet(this.form.getRawValue()));
      this.pets = [pet, ...this.pets];
      this.form.patchValue({ name: '', species: '', breed: '', birthDate: '', notes: '' });
    } finally {
      this.loading = false;
    }
  }

  async remove(id: string): Promise<void> {
    await firstValueFrom(this.apiService.deletePet(id));
    this.pets = this.pets.filter((pet) => pet._id !== id);
  }

  // Normaliza ownerId cuando backend devuelve populate parcial/completo.
  extractOwner(value: unknown): string {
    const owner = value as { fullName?: string } | undefined;
    return owner?.fullName ?? 'Dueño';
  }
}
