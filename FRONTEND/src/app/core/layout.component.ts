// Shell visual de la zona privada:
// - menú lateral
// - cabecera con usuario
// - contenedor para rutas hijas
import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand">
          <span class="brand-mark">V</span>
          <div>
            <h1>VetCore</h1>
            <p>Gestión veterinaria</p>
          </div>
        </div>

        <nav class="menu">
          <a routerLink="/app/dashboard" routerLinkActive="active">Panel</a>
          <a routerLink="/app/owners" routerLinkActive="active">Dueños</a>
          <a routerLink="/app/pets" routerLinkActive="active">Mascotas</a>
          <a routerLink="/app/appointments" routerLinkActive="active">Citas</a>
          <a routerLink="/app/records" routerLinkActive="active">Historia clínica</a>
          <a routerLink="/app/diagnostics" routerLinkActive="active">Diagnósticos</a>
        </nav>
      </aside>

      <section class="content">
        <header class="topbar">
          <div>
            <span class="eyebrow">Veterinaria</span>
            <h2>Bienvenido, {{ userName() }}</h2>
          </div>
          <button type="button" (click)="logout()">Cerrar sesión</button>
        </header>

        <main class="page">
          <router-outlet></router-outlet>
        </main>
      </section>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100dvh;
      }

      .shell {
        min-height: 100dvh;
        display: grid;
        grid-template-columns: 280px 1fr;
        background: linear-gradient(180deg, #f7f9fc 0%, #eef3f8 100%);
        color: #172033;
      }

      .sidebar {
        padding: 32px 24px;
        background: linear-gradient(180deg, #0f172a 0%, #16213e 100%);
        color: #e5eefc;
        display: flex;
        flex-direction: column;
        gap: 32px;
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .brand h1 {
        margin: 0;
        font-size: 1.4rem;
      }

      .brand p,
      .eyebrow {
        margin: 0;
        color: rgba(229, 238, 252, 0.72);
      }

      .brand-mark {
        width: 52px;
        height: 52px;
        border-radius: 16px;
        display: grid;
        place-items: center;
        background: linear-gradient(135deg, #22c55e, #38bdf8);
        color: white;
        font-weight: 800;
        font-size: 1.3rem;
      }

      .menu {
        display: grid;
        gap: 10px;
      }

      .menu a {
        text-decoration: none;
        color: #dbe7ff;
        padding: 14px 16px;
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
      }

      .menu a.active {
        background: rgba(56, 189, 248, 0.18);
        border-color: rgba(56, 189, 248, 0.35);
      }

      .content {
        display: grid;
        grid-template-rows: auto 1fr;
        min-width: 0;
      }

      .topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 24px 28px 12px;
      }

      .topbar h2 {
        margin: 6px 0 0;
        font-size: 1.65rem;
      }

      .topbar button {
        border: 0;
        background: #e11d48;
        color: white;
        padding: 12px 18px;
        border-radius: 999px;
        font-weight: 700;
        cursor: pointer;
      }

      .page {
        padding: 16px 28px 32px;
      }

      @media (max-width: 980px) {
        .shell {
          grid-template-columns: 1fr;
        }

        .sidebar {
          padding-bottom: 20px;
        }
      }
    `
  ]
})
export class LayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Nombre reactivo mostrado en la cabecera.
  readonly userName = computed(() => this.authService.user()?.fullName ?? 'Usuario');

  logout(): void {
    // Limpia sesión local y vuelve a pantalla pública.
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
