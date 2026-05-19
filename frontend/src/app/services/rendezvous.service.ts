import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RendezVous, ApiResponse } from '../models/patient.model';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RendezvousService {
  private apiUrl = `${environment.rendezvousApiUrl}/rendezvous`;

  constructor(private http: HttpClient) {}

  getAll(filters?: { patientId?: number; statut?: string; date?: string }): Observable<ApiResponse<RendezVous[]>> {
    let params = new HttpParams();
    if (filters?.patientId) params = params.set('patientId', filters.patientId.toString());
    if (filters?.statut) params = params.set('statut', filters.statut);
    if (filters?.date) params = params.set('date', filters.date);

    return this.http.get<ApiResponse<RendezVous[]>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<ApiResponse<RendezVous>> {
    return this.http.get<ApiResponse<RendezVous>>(`${this.apiUrl}/${id}`);
  }

  create(rdv: Partial<RendezVous>): Observable<ApiResponse<RendezVous>> {
    return this.http.post<ApiResponse<RendezVous>>(this.apiUrl, rdv);
  }

  update(id: number, rdv: Partial<RendezVous>): Observable<ApiResponse<RendezVous>> {
    return this.http.put<ApiResponse<RendezVous>>(`${this.apiUrl}/${id}`, rdv);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  getStats(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/stats`);
  }
}
