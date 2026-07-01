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

/**
 * Raw HTTP access for the financial-impact view. Kept separate from
 * FinancialImpactApi so the facade only deals with entity mapping.
 */
export class FinancialImpactApiEndpoint {
  private readonly equipUrl: string;

  constructor(private readonly http: HttpClient) {
    this.equipUrl = `${environment.apiBase}/equipments`;
  }

  getUsageStats(): Observable<EquipmentUsageStatResource[]> {
    // Not yet exposed by the real backend — see analytics-response.ts.
    return of([]);
  }

  getEquipments(): Observable<EquipmentResource[]> {
    return this.http.get<EquipmentResource[]>(this.equipUrl);
  }

  getMaintenanceTickets(): Observable<MaintenanceTicketResource[]> {
    // Not yet exposed by the real backend.
    return of([]);
  }

  getMaintenanceLogs(): Observable<MaintenanceLogResource[]> {
    // Not yet exposed by the real backend.
    return of([]);
  }

  getSpareParts(): Observable<SparePartResource[]> {
    // Not yet exposed by the real backend.
    return of([]);
  }
}
