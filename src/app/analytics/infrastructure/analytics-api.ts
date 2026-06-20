import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EquipmentUsageStatResource, EquipmentResource } from './analytics-response';

@Injectable({ providedIn: 'root' })
export class AnalyticsApi {
  private readonly base = environment.apiBase;

  constructor(private readonly http: HttpClient) {}

  getUsageStats(): Observable<EquipmentUsageStatResource[]> {
    return of([]);
  }

  getEquipments(): Observable<EquipmentResource[]> {
    return this.http.get<EquipmentResource[]>(`${this.base}/equipments`);
  }

  requestActivityAnalysis(body: {
    minutesActive: number; minutesInactive: number;
    downtimeReason: string; percentageChange: number;
  }): Observable<any> {
    return this.http.post(`${this.base}/activity-reports`, body);
  }

  requestMaintenanceQuote(body: {
    amount: number; currency: string; costTypeValue: string;
    partName: string; quantity: number; unitPrice: number;
  }): Observable<any> {
    return this.http.post(`${this.base}/maintenance-quotes`, body);
  }

  requestROIProjection(body: { expectedRoiPercentage: number }): Observable<any> {
    return this.http.post(`${this.base}/roi-projections`, body);
  }
}
