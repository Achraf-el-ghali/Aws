import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DossierMedical, Consultation, Ordonnance, Examen, ApiResponse } from '../models/patient.model';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DossierService {
  private apiUrl = `${environment.dossiersApiUrl}/dossiers`;

  constructor(private http: HttpClient) {}

  getAll(search?: string): Observable<ApiResponse<DossierMedical[]>> {
    const params = search ? `?search=${search}` : '';
    return this.http.get<ApiResponse<DossierMedical[]>>(`${this.apiUrl}${params}`);
  }

  getById(id: string): Observable<ApiResponse<DossierMedical>> {
    return this.http.get<ApiResponse<DossierMedical>>(`${this.apiUrl}/${id}`);
  }

  getByPatientId(patientId: number): Observable<ApiResponse<DossierMedical>> {
    return this.http.get<ApiResponse<DossierMedical>>(`${this.apiUrl}/patient/${patientId}`);
  }

  create(dossier: Partial<DossierMedical>): Observable<ApiResponse<DossierMedical>> {
    return this.http.post<ApiResponse<DossierMedical>>(this.apiUrl, dossier);
  }

  update(id: string, dossier: Partial<DossierMedical>): Observable<ApiResponse<DossierMedical>> {
    return this.http.put<ApiResponse<DossierMedical>>(`${this.apiUrl}/${id}`, dossier);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  addConsultation(id: string, consultation: Consultation): Observable<ApiResponse<DossierMedical>> {
    return this.http.post<ApiResponse<DossierMedical>>(`${this.apiUrl}/${id}/consultations`, consultation);
  }

  addOrdonnance(id: string, ordonnance: Ordonnance): Observable<ApiResponse<DossierMedical>> {
    return this.http.post<ApiResponse<DossierMedical>>(`${this.apiUrl}/${id}/ordonnances`, ordonnance);
  }

  addExamen(id: string, examen: Examen): Observable<ApiResponse<DossierMedical>> {
    return this.http.post<ApiResponse<DossierMedical>>(`${this.apiUrl}/${id}/examens`, examen);
  }

  getStats(): Observable<ApiResponse<{ totalDossiers: number }>> {
    return this.http.get<ApiResponse<{ totalDossiers: number }>>(`${this.apiUrl}/stats`);
  }
}
