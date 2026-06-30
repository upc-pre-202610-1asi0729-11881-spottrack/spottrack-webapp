import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CreateClientProfileRequest { userId: number; email: string; }
export interface CreateAdminProfileRequest  { email: string; }
export interface UpdatePersonInfoRequest {
  firstName:   string;
  lastName:    string;
  phoneNumber: string;
  dni:         string;
}

@Injectable({ providedIn: 'root' })
export class ProfileApiService {
  private readonly base = `${environment.apiBase}/profiles`;

  constructor(private readonly http: HttpClient) {}

  createClientProfile(body: CreateClientProfileRequest): Observable<unknown> {
    return this.http.post(`${this.base}/clients`, body);
  }

  updateClientProfile(body: UpdatePersonInfoRequest): Observable<unknown> {
    return this.http.put(`${this.base}/clients/me`, body);
  }

  createAdminProfile(body: CreateAdminProfileRequest): Observable<unknown> {
    return this.http.post(`${this.base}/admins`, body);
  }

  updateAdminProfile(body: UpdatePersonInfoRequest): Observable<unknown> {
    return this.http.put(`${this.base}/admins/me`, body);
  }
}
