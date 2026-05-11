import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  EquipmentUsageStatResource,
  EquipmentResource,
} from './financial-response';

@Injectable({ providedIn: 'root' })
export class FinancialApi {
  private readonly statsUrl = `${environment.apiProvider}${environment.equipmentUsageStatsEndpoint}`;
  private readonly equipUrl = `${environment.apiProvider}${environment.equipmentEndpoints}`;

  constructor(private readonly http: HttpClient) {}

  getUsageStats(): Observable<EquipmentUsageStatResource[]> {
    return this.http.get<EquipmentUsageStatResource[]>(this.statsUrl);
  }

  getEquipments(): Observable<EquipmentResource[]> {
    return this.http.get<EquipmentResource[]>(this.equipUrl);
  }
}
