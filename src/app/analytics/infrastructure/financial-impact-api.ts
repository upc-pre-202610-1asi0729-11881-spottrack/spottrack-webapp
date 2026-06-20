import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  EquipmentUsageStatResource,
  EquipmentResource,
} from './analytics-response';

@Injectable({ providedIn: 'root' })
export class FinancialImpactApi {
  private readonly equipUrl = `${environment.apiBase}/equipments`;

  constructor(private readonly http: HttpClient) {}

  getUsageStats(): Observable<EquipmentUsageStatResource[]> {
    return of([]);
  }

  getEquipments(): Observable<EquipmentResource[]> {
    return this.http.get<EquipmentResource[]>(this.equipUrl);
  }

  getMaintenanceTickets(): Observable<any[]> {
    return of([]);
  }

  getMaintenanceLogs(): Observable<any[]> {
    return of([]);
  }

  getSpareParts(): Observable<any[]> {
    return of([]);
  }
}
