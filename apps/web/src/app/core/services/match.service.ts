import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '@khelo/types';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MatchService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/matches`;

  matches = signal<any[]>([]);
  total = signal<number>(0);
  loading = signal<boolean>(false);

  getMatches(filters: any = {}, force: boolean = false): Observable<ApiResponse<any[]>> {
    // Basic cache check: if no filters and matches already exist, don't fetch unless forced
    if (!force && Object.keys(filters).length === 0 && this.matches().length > 0) {
      return new Observable(obs => {
        obs.next({ success: true, data: this.matches(), timestamp: new Date().toISOString() });
        obs.complete();
      });
    }

    this.loading.set(true);
    let params = new HttpParams();
    
    if (filters.sportType) params = params.set('sportType', filters.sportType);
    if (filters.format) params = params.set('format', filters.format);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.startDate) params = params.set('startDate', filters.startDate);
    if (filters.endDate) params = params.set('endDate', filters.endDate);
    if (filters.skip) params = params.set('skip', filters.skip.toString());
    if (filters.take) params = params.set('take', filters.take.toString());

    return this.http.get<ApiResponse<any[]>>(this.API_URL, { params }).pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.matches.set(res.data);
          if (res.meta) this.total.set(res.meta.total);
        }
        this.loading.set(false);
      })
    );
  }

  createMatch(data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.API_URL, data);
  }
}
