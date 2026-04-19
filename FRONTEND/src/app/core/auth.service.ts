// Servicio de autenticación:
// - inicia sesión contra backend
// - persiste token y usuario
// - restaura sesión al recargar la app
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs';
import { AuthSession, AuthUser, LoginRequest } from './models';

const apiBaseUrl = 'http://localhost:3000/api';
const storageKey = 'mi_veterinaria_session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  readonly user = signal<AuthUser | null>(null);
  readonly token = signal<string | null>(null);
  // Se usa en guards y vistas para saber si hay sesión activa.
  readonly isAuthenticated = computed(() => Boolean(this.token()));

  constructor() {
    this.restoreSession();
  }

  login(payload: LoginRequest) {
    // El backend responde con token + usuario.
    return this.http.post<AuthSession>(`${apiBaseUrl}/auth/login`, payload).pipe(
      tap((session) => this.saveSession(session)),
      map((session) => session.user)
    );
  }

  logout(): void {
    this.user.set(null);
    this.token.set(null);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(storageKey);
    }
  }

  getToken(): string | null {
    return this.token();
  }

  private restoreSession(): void {
    // En SSR no existe localStorage, por eso se corta temprano.
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const storedValue = localStorage.getItem(storageKey);
    if (!storedValue) {
      return;
    }

    try {
      const parsedValue = JSON.parse(storedValue) as AuthSession;
      this.user.set(parsedValue.user);
      this.token.set(parsedValue.token);
    } catch {
      localStorage.removeItem(storageKey);
    }
  }

  private saveSession(session: AuthSession): void {
    // Actualiza estado reactivo para UI y guards.
    this.user.set(session.user);
    this.token.set(session.token);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(storageKey, JSON.stringify(session));
    }
  }
}
