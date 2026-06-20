import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SensorSessionResource, SensorReadingResource } from './monitoring-response';

@Injectable({ providedIn: 'root' })
export class MonitoringApi {
  private readonly sessionsUrl = `${environment.apiBase}/sensor-sessions`;
  private readonly readingsUrl = `${environment.apiBase}/sensor-readings`;

  constructor(private readonly http: HttpClient) {}

  getSessions(): Observable<SensorSessionResource[]> {
    return this.http.get<SensorSessionResource[]>(this.sessionsUrl);
  }

  getReadings(): Observable<SensorReadingResource[]> {
    return this.http.get<SensorReadingResource[]>(this.readingsUrl);
  }
}
