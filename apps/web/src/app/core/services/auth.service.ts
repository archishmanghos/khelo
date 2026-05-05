import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError, of, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string;
}

export interface AuthResponse {
  status: string;
  data: {
    user: User;
    accessToken: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/auth`;

  private accessToken: string | null = localStorage.getItem('accessToken');

  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(!!this.accessToken);
  isInitialLoading = signal<boolean>(true);

  constructor() {
    setTimeout(() => this.checkSession(), 0);
  }

  getAccessToken() {
    return this.accessToken;
  }

  signup(data: any): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/signup`, data)
      .pipe(tap((res) => this.handleAuthSuccess(res)));
  }

  login(data: any): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/login`, data)
      .pipe(tap((res) => this.handleAuthSuccess(res)));
  }

  googleAuth(idToken: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/google`, { idToken })
      .pipe(tap((res) => this.handleAuthSuccess(res)));
  }

  refresh(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/refresh`, {}).pipe(
      tap((res) => this.handleAuthSuccess(res)),
      catchError((err) => {
        this.handleAuthLogout();
        throw err;
      }),
    );
  }

  logout() {
    return this.http.post(`${this.API_URL}/logout`, {}).pipe(
      tap(() => this.handleAuthLogout()),
      catchError(() => {
        this.handleAuthLogout();
        return of(null);
      }),
    );
  }

  private handleAuthSuccess(res: AuthResponse) {
    this.accessToken = res.data.accessToken;
    localStorage.setItem('accessToken', this.accessToken);
    this.currentUser.set(res.data.user);
    this.isAuthenticated.set(true);
  }

  private handleAuthLogout() {
    this.accessToken = null;
    localStorage.removeItem('accessToken');
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  private checkSession() {
    console.log('AuthService: Checking session...', { hasToken: !!this.accessToken });
    if (!this.accessToken) {
      console.log('AuthService: No access token, attempting refresh...');
      this.refresh().subscribe({
        next: () => {
          console.log('AuthService: Session recovered via refresh');
          this.isInitialLoading.set(false);
        },
        error: (err) => {
          console.log('AuthService: Session recovery failed', err);
          this.handleAuthLogout();
          this.isInitialLoading.set(false);
        }
      });
      return;
    }

    console.log('AuthService: Access token found, fetching profile...');
    this.http.get<{ data: { user: User } }>(`${this.API_URL}/me`).subscribe({
      next: (res) => {
        console.log('AuthService: Profile fetched', res.data.user);
        this.currentUser.set(res.data.user);
        this.isAuthenticated.set(true);
        this.isInitialLoading.set(false);
      },
      error: (err) => {
        console.log('AuthService: Profile fetch failed', err);
        // Try refresh if me fails
        this.refresh().subscribe({
          next: () => {
            console.log('AuthService: Session recovered after profile failure');
            this.isInitialLoading.set(false);
          },
          error: (refreshErr) => {
            console.log('AuthService: Final session recovery failed', refreshErr);
            this.handleAuthLogout();
            this.isInitialLoading.set(false);
          },
        });
      },
    });
  }
}
