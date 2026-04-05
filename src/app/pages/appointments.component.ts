// Agenda operativa de citas veterinarias.
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../core/api.service';
import { Appointment, Pet } from '../core/models';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page">
      <div class="header">
        <div>
          <p class="eyebrow">Citas</p>
          <h3>Agenda de atención</h3>
        </div>
      </div>

      <form class="card form" [formGroup]="form" (ngSubmit)="save()">
        <select formControlName="petId">
          <option value="">Selecciona una mascota</option>
          <option *ngFor="let pet of pets" [value]="pet._id">{{ pet.name }}</option>
        </select>
        <input formControlName="veterinarianName" placeholder="Veterinario" />
        <input formControlName="dateTime" type="datetime-local" />
        <input formControlName="reason" placeholder="Motivo de la cita" />
        <select formControlName="status">
          <option value="programada">Programada</option>
          <option value="atendida">Atendida</option>
          <option value="cancelada">Cancelada</option>
        </select>
        <input class="wide" formControlName="notes" placeholder="Notas" />
        <button type="submit" [disabled]="form.invalid || loading">Agregar cita</button>
      </form>

      <section class="card list">
        <div class="row" *ngFor="let appointment of appointments">
          <div>
            <strong>{{ extractPet(appointment.petId) }}</strong>
            <p>
              {{ appointment.veterinarianName }} · {{ appointment.reason }} ·
              {{ appointment.dateTime | date: 'medium' }}
            </p>
            <small>{{ appointment.notes }}</small>
          </div>
          <div class="actions">
            <button type="button" (click)="setStatus(appointment._id, 'atendida')">Atender</button>
            <button type="button" (click)="setStatus(appointment._id, 'cancelada')">Cancelar</button>
            <button type="button" (click)="remove(appointment._id)">Eliminar</button>
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
      .actions button {
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
        flex-wrap: wrap;
        gap: 10px;
        justify-content: flex-end;
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

        .actions {
          justify-content: flex-start;
        }
      }
    `
  ]
})
export class AppointmentsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly apiService = inject(ApiService);

  // Catálogo de mascotas + dataset de citas para render.
  pets: Pet[] = [];
  appointments: Appointment[] = [];
  loading = false;

  // Formulario de programación de citas.
  readonly form = this.fb.nonNullable.group({
    petId: ['', Validators.required],
    veterinarianName: ['Dra. Laura Pérez', Validators.required],
    dateTime: ['', Validators.required],
    reason: ['', Validators.required],
    status: ['programada' as Appointment['status'], Validators.required],
    notes: ['']
  });

  constructor() {
    void this.reload();
  }

  async reload(): Promise<void> {
    // Carga inicial en paralelo para minimizar espera percibida.
    const [pets, appointments] = await Promise.all([
      firstValueFrom(this.apiService.listPets()),
      firstValueFrom(this.apiService.listAppointments())
    ]);

    this.pets = pets;
    this.appointments = appointments;

    // Preselecciona mascota para agilizar altas rápidas.
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
      // Inserta cita y refresca lista local sin recargar toda la vista.
      const appointment = await firstValueFrom(this.apiService.createAppointment(this.form.getRawValue()));
      this.appointments = [appointment, ...this.appointments];
      this.form.patchValue({ reason: '', notes: '' });
    } finally {
      this.loading = false;
    }
  }

  async setStatus(id: string, status: Appointment['status']): Promise<void> {
    // Actualiza únicamente el estado seleccionado en backend y lista local.
    const appointment = await firstValueFrom(this.apiService.updateAppointmentStatus(id, status));
    this.appointments = this.appointments.map((item) => (item._id === id ? appointment : item));
  }

  async remove(id: string): Promise<void> {
    await firstValueFrom(this.apiService.deleteAppointment(id));
    this.appointments = this.appointments.filter((appointment) => appointment._id !== id);
  }

  // Normaliza petId cuando la API entrega referencia poblada.
  extractPet(value: unknown): string {
    const pet = value as { name?: string } | undefined;
    return pet?.name ?? 'Mascota';
  }
}
