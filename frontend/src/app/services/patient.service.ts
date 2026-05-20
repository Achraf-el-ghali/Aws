import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Patient, ApiResponse } from '../models/patient.model';
import { AppConfigService } from '../core/config/app-config.service';

@Injectable({ providedIn: 'root' })
export class PatientService {
  constructor(
    private http: HttpClient,
    private config: AppConfigService,
  ) {}

  private get apiUrl(): string {
    return `${this.config.apiBaseUrl}/patients`;
  }

  getAll(search?: string): Observable<ApiResponse<Patient[]>> {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.http.get<ApiResponse<Patient[]>>(`${this.apiUrl}${params}`);
  }

  getById(id: number): Observable<ApiResponse<Patient>> {
    return this.http.get<ApiResponse<Patient>>(`${this.apiUrl}/${id}`);
  }

  create(patient: Patient): Observable<ApiResponse<Patient>> {
    return this.http.post<ApiResponse<Patient>>(this.apiUrl, patient);
  }

  update(id: number, patient: Patient): Observable<ApiResponse<Patient>> {
    return this.http.put<ApiResponse<Patient>>(`${this.apiUrl}/${id}`, patient);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  getStats(): Observable<ApiResponse<{ totalPatients: number }>> {
    return this.http.get<ApiResponse<{ totalPatients: number }>>(`${this.apiUrl}/stats`);
  }
}
