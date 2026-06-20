import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SignInRequest  { username: string; password: string; }
export interface SignUpRequest  { username: string; password: string; roles: string[]; }
export interface AuthResponse   { id: number; username: string; token: string; roles: string[]; }

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly base = `${environment.apiBase}/authentication`;

  constructor(private readonly http: HttpClient) {}

  signIn(body: SignInRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/sign-in`, body);
  }

  signUp(body: SignUpRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/sign-up`, body);
  }
}
