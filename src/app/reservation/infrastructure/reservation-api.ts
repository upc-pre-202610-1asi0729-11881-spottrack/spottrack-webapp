import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ReservationResource } from './reservation-response';

@Injectable({ providedIn: 'root' })
export class ReservationApi {
  private readonly reservationsUrl = `${environment.apiProvider}reservations`;

  constructor(private readonly http: HttpClient) {}

  getReservations(): Observable<ReservationResource[]> {
    return this.http.get<ReservationResource[]>(this.reservationsUrl);
  }

  createReservation(machineId: string, durationSeconds: number): Observable<ReservationResource> {
    return this.http.post<ReservationResource>(this.reservationsUrl, { machine_id: machineId, duration_seconds: durationSeconds });
  }

  cancelReservation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.reservationsUrl}/${id}`);
  }
}
