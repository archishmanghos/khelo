import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/v1/auth';

  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor() {
    this.checkSession();
  }

  signup(data: any) {
    return this.http.post<{ data: { user: User; accessToken: string } }>(`${this.API_URL}/signup`, data).pipe(
      tap((res) => {
        this.currentUser.set(res.data.user);
        this.isAuthenticated.set(true);
      })
    );
  }

  login(data: any) {
    return this.http.post<{ data: { user: User; accessToken: string } }>(`${this.API_URL}/login`, data).pipe(
      tap((res) => {
        this.currentUser.set(res.data.user);
        this.isAuthenticated.set(true);
      })
    );
  }

  googleAuth(idToken: string) {
    return this.http.post<{ data: { user: User; accessToken: string } }>(`${this.API_URL}/google`, { idToken }).pipe(
      tap((res) => {
        this.currentUser.set(res.data.user);
        this.isAuthenticated.set(true);
      })
    );
  }

  logout() {
    return this.http.post(`${this.API_URL}/logout`, {}).pipe(
      tap(() => {
        this.currentUser.set(null);
        this.isAuthenticated.set(false);
      })
    );
  }

  private checkSession() {
    this.http.get<{ data: { user: User } }>(`${this.API_URL}/me`).subscribe({
      next: (res) => {
        this.currentUser.set(res.data.user);
        this.isAuthenticated.set(true);
      },
      error: () => {
        this.currentUser.set(null);
        this.isAuthenticated.set(false);
      },
    });
  }
}
