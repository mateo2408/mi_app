import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

type QueryValue = string | number | boolean;

export interface ApiClient {
  get<T>(path: string, options?: { params?: Record<string, QueryValue> }): Observable<T>;
  post<T>(path: string, body: unknown, options?: { params?: Record<string, QueryValue> }): Observable<T>;
  put<T>(path: string, body: unknown, options?: { params?: Record<string, QueryValue> }): Observable<T>;
  patch<T>(path: string, body: unknown, options?: { params?: Record<string, QueryValue> }): Observable<T>;
  delete<T>(path: string, options?: { params?: Record<string, QueryValue> }): Observable<T>;
}

@Injectable({ providedIn: 'root' })
export class AuthenticatedApiClient implements ApiClient {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  get<T>(path: string, options?: { params?: Record<string, QueryValue> }): Observable<T> {
    return this.http.get<T>(path, this.withAuth(options));
  }

  post<T>(path: string, body: unknown, options?: { params?: Record<string, QueryValue> }): Observable<T> {
    return this.http.post<T>(path, body, this.withAuth(options));
  }

  put<T>(path: string, body: unknown, options?: { params?: Record<string, QueryValue> }): Observable<T> {
    return this.http.put<T>(path, body, this.withAuth(options));
  }

  patch<T>(path: string, body: unknown, options?: { params?: Record<string, QueryValue> }): Observable<T> {
    return this.http.patch<T>(path, body, this.withAuth(options));
  }

  delete<T>(path: string, options?: { params?: Record<string, QueryValue> }): Observable<T> {
    return this.http.delete<T>(path, this.withAuth(options));
  }

  private withAuth(options?: { params?: Record<string, QueryValue> }) {
    const token = this.authService.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();

    return {
      ...options,
      headers
    };
  }
}

export const API_CLIENT = new InjectionToken<ApiClient>('API_CLIENT', {
  providedIn: 'root',
  factory: () => inject(AuthenticatedApiClient)
});
