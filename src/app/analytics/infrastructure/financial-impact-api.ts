import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  EquipmentUsageStatResource,
  EquipmentResource,
  MaintenanceTicketResource,
  MaintenanceLogResource,
  SparePartResource,
} from './financial-impact-response';

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

  getMaintenanceTickets(): Observable<MaintenanceTicketResource[]> {
    return of([]);
  }

  getMaintenanceLogs(): Observable<MaintenanceLogResource[]> {
    return of([]);
  }

  getSpareParts(): Observable<SparePartResource[]> {
    return of([]);
  }
}
