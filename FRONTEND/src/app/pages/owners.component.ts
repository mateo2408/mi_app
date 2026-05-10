// Gestión CRUD básica de dueños de mascotas.
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../core/api.service';
import { Owner } from '../core/models';

@Component({
  selector: 'app-owners',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page">
      <div class="header">
        <div>
          <p class="eyebrow">Dueños</p>
          <h3>Personas responsables de las mascotas</h3>
        </div>
      </div>

      <form class="card form" [formGroup]="form" (ngSubmit)="save()">
        <input formControlName="fullName" placeholder="Nombre completo" />
        <input formControlName="cedula" placeholder="Cédula / Documento" />
        <input formControlName="phone" placeholder="Teléfono" />
        <input formControlName="email" type="email" placeholder="Correo" />
        <input formControlName="address" placeholder="Dirección" />

        <select formControlName="country" (change)="onCountryChange($event)">
          <option value="">Selecciona un país</option>
          <option *ngFor="let c of countries" [value]="c._id">{{ c.name }}</option>
        </select>
        <select formControlName="province" (change)="onProvinceChange($event)">
          <option value="">Selecciona una provincia</option>
          <option *ngFor="let p of provinces" [value]="p._id">{{ p.name }}</option>
        </select>
        <select formControlName="city">
          <option value="">Selecciona una ciudad</option>
          <option *ngFor="let city of cities" [value]="city._id">{{ city.name }}</option>
        </select>

        <button type="submit" [disabled]="form.invalid || loading">Agregar dueño</button>
      </form>

      <section class="card list">
        <p class="status error" *ngIf="errorMessage">{{ errorMessage }}</p>
        <p class="status" *ngIf="!errorMessage && owners.length === 0">No hay dueños registrados.</p>
        <div class="row" *ngFor="let owner of owners">
          <div>
            <strong>{{ owner.fullName }}</strong>
            <p>{{ owner.phone }} · {{ owner.email }}</p>
            <small>{{ owner.address }}</small>
          </div>
          <button type="button" (click)="remove(owner._id)">Eliminar</button>
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
        grid-template-columns: repeat(5, minmax(0, 1fr));
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
export class OwnersComponent {
  private readonly fb = inject(FormBuilder);
  private readonly apiService = inject(ApiService);

  // Lista local que respalda el render de la tabla/listado.
  owners: Owner[] = [];
  loading = false;
  errorMessage = '';
  countries: any[] = [];
  provinces: any[] = [];
  cities: any[] = [];

  // Formulario de creación rápida de dueño.
  readonly form = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    cedula: [''],
    phone: [''],
    email: [''],
    address: [''],
    country: [''],
    province: [''],
    city: ['']
  });

  constructor() {
    void this.reload();
  }

  async reload(): Promise<void> {
    // Sin paginación por simplicidad en esta versión base.
    this.errorMessage = '';

    try {
      this.owners = await firstValueFrom(this.apiService.listOwners());
      this.countries = await firstValueFrom(this.apiService.listCountries());
    } catch {
      this.owners = [];
      this.errorMessage = 'No se pudieron cargar los dueños. Verifica que la API esté encendida y tu sesión siga activa.';
    }
  }

  async onCountryChange(event: Event): Promise<void> {
    const countryId = (event.target as HTMLSelectElement)?.value ?? '';
    this.provinces = [];
    this.cities = [];
    if (!countryId) return;
    this.provinces = await firstValueFrom(this.apiService.listProvinces(countryId));
    // clear selection in form
    this.form.patchValue({ province: '', city: '' });
  }

  async onProvinceChange(event: Event): Promise<void> {
    const provinceId = (event.target as HTMLSelectElement)?.value ?? '';
    this.cities = [];
    if (!provinceId) return;
    this.cities = await firstValueFrom(this.apiService.listCities(provinceId));
    this.form.patchValue({ city: '' });
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    try {
      // Inserta nuevo dueño y actualiza UI de forma optimista local.
      const owner = await firstValueFrom(this.apiService.createOwner(this.form.getRawValue()));
      this.owners = [owner, ...this.owners];
      this.form.reset();
      this.provinces = [];
      this.cities = [];
    } finally {
      this.loading = false;
    }
  }

  async remove(id: string): Promise<void> {
    // Elimina en backend y sincroniza la lista visible.
    await firstValueFrom(this.apiService.deleteOwner(id));
    this.owners = this.owners.filter((owner) => owner._id !== id);
  }
}
