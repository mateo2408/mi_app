// Pantalla pública de acceso.
// Aquí se valida formulario y se inicializa la sesión JWT.
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="login">
      <div class="panel intro">
        <p class="badge">Veterinaria</p>
        <h1>Acceso al sistema</h1>
        <p>
          Inicia sesión para administrar dueños, mascotas, citas y el historial clínico.
        </p>
        <div class="hint">
          <strong>Credenciales de prueba:</strong>
          <span>admin@vet.com / Admin123*</span>
        </div>
      </div>

      <form class="panel form" [formGroup]="form" (ngSubmit)="submit()">
        <h2>Entrar</h2>
        <label>
          Correo
          <input type="email" formControlName="email" placeholder="admin@vet.com" />
        </label>
        <label>
          Contraseña
          <input type="password" formControlName="password" placeholder="••••••••" />
        </label>
        <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
        <button type="submit" [disabled]="form.invalid || loading">
          {{ loading ? 'Ingresando...' : 'Ingresar' }}
        </button>
      </form>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100dvh;
      }

      .login {
        min-height: 100dvh;
        display: grid;
        grid-template-columns: 1.1fr 0.9fr;
        gap: 24px;
        padding: 32px;
        background:
          radial-gradient(circle at top left, rgba(56, 189, 248, 0.28), transparent 28%),
          radial-gradient(circle at bottom right, rgba(34, 197, 94, 0.22), transparent 28%),
          linear-gradient(180deg, #f8fbff 0%, #edf4fb 100%);
        color: #172033;
      }

      .panel {
        border-radius: 28px;
        background: rgba(255, 255, 255, 0.78);
        border: 1px solid rgba(148, 163, 184, 0.22);
        box-shadow: 0 24px 80px rgba(15, 23, 42, 0.12);
        backdrop-filter: blur(12px);
      }

      .intro {
        padding: 40px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-height: 420px;
      }

      .badge {
        align-self: flex-start;
        margin: 0 0 16px;
        padding: 8px 14px;
        border-radius: 999px;
        background: rgba(14, 165, 233, 0.12);
        color: #0369a1;
        font-weight: 700;
      }

      h1,
      h2,
      p {
        margin: 0;
      }

      h1 {
        font-size: clamp(2.5rem, 5vw, 4.8rem);
        line-height: 0.95;
        max-width: 8ch;
      }

      .intro > p {
        max-width: 32rem;
        font-size: 1.05rem;
        color: #405069;
        line-height: 1.7;
      }

      .hint {
        display: grid;
        gap: 8px;
        padding: 18px 20px;
        border-radius: 18px;
        background: #0f172a;
        color: #e5eefc;
        max-width: 22rem;
      }

      .form {
        align-self: center;
        padding: 36px;
        display: grid;
        gap: 16px;
      }

      .form h2 {
        font-size: 1.8rem;
        margin-bottom: 8px;
      }

      label {
        display: grid;
        gap: 8px;
        font-weight: 600;
        color: #334155;
      }

      input {
        border: 1px solid #cbd5e1;
        border-radius: 16px;
        padding: 14px 16px;
        font-size: 1rem;
        background: white;
      }

      input:focus {
        outline: 2px solid rgba(14, 165, 233, 0.25);
        border-color: #0ea5e9;
      }

      button {
        margin-top: 8px;
        border: 0;
        border-radius: 18px;
        background: linear-gradient(135deg, #0f172a, #2563eb);
        color: white;
        padding: 15px 18px;
        font-weight: 800;
        cursor: pointer;
      }

      button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }

      .error {
        color: #b91c1c;
        font-weight: 700;
      }

      @media (max-width: 900px) {
        .login {
          grid-template-columns: 1fr;
        }
      }
    `
  ]
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Estado de UI para feedback del proceso de autenticación.
  loading = false;
  errorMessage = '';

  // Formulario reactivo con valores por defecto para pruebas locales.
  readonly form = this.fb.nonNullable.group({
    email: ['admin@vet.com', [Validators.required, Validators.email]],
    password: ['Admin123*', [Validators.required, Validators.minLength(6)]]
  });

  async submit(): Promise<void> {
    // Evita enviar peticiones con datos inválidos.
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      // Inicia sesión y, si responde OK, navega al dashboard privado.
      await firstValueFrom(this.authService.login(this.form.getRawValue()));
      await this.router.navigateByUrl('/app/dashboard');
    } catch {
      // Mensaje genérico para no filtrar detalles de autenticación.
      this.errorMessage = 'No pudimos iniciar sesión. Revisa el correo y la contraseña.';
    } finally {
      this.loading = false;
    }
  }
}
