import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  EquipmentUsageStatResource,
  EquipmentResource,
  MaintenanceTicketResource,
  MaintenanceLogResource,
  SparePartResource,
} from './financial-response';

@Injectable({ providedIn: 'root' })
export class FinancialApi {
  private readonly statsUrl    = `${environment.apiProvider}${environment.equipmentUsageStatsEndpoint}`;
  private readonly equipUrl    = `${environment.apiProvider}${environment.equipmentEndpoints}`;
  private readonly ticketsUrl  = `${environment.apiProvider}${environment.maintenanceTicketsEndpoint}`;
  private readonly logsUrl     = `${environment.apiProvider}${environment.maintenanceLogsEndpoint}`;
  private readonly partsUrl    = `${environment.apiProvider}${environment.sparePartsEndpoint}`;

  constructor(private readonly http: HttpClient) {}

  getUsageStats(): Observable<EquipmentUsageStatResource[]> {
    return this.http.get<EquipmentUsageStatResource[]>(this.statsUrl);
  }

  getEquipments(): Observable<EquipmentResource[]> {
    return this.http.get<EquipmentResource[]>(this.equipUrl);
  }

  getMaintenanceTickets(): Observable<MaintenanceTicketResource[]> {
    return this.http.get<MaintenanceTicketResource[]>(this.ticketsUrl);
  }

  getMaintenanceLogs(): Observable<MaintenanceLogResource[]> {
    return this.http.get<MaintenanceLogResource[]>(this.logsUrl);
  }

  getSpareParts(): Observable<SparePartResource[]> {
    return this.http.get<SparePartResource[]>(this.partsUrl);
  }
}
