import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Patient, ApiResponse } from '../models/patient.model';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  private apiUrl = `${environment.patientsApiUrl}/patients`;

  constructor(private http: HttpClient) {}

  getAll(search?: string): Observable<ApiResponse<Patient[]>> {
    const params = search ? `?search=${search}` : '';
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
