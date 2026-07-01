import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

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

  updateClientProfile(body: UpdatePersonInfoRequest): Observable<unknown> {
    return this.http.put(`${this.base}/clients/me`, body);
  }
}
