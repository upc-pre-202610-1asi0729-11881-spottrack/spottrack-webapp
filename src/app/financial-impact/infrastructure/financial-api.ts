import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  EquipmentUsageStatResource,
  EquipmentResource,
} from './financial-response';

@Injectable({ providedIn: 'root' })
export class FinancialApi {
  private readonly equipUrl = `${environment.apiBase}/equipments`;

  constructor(private readonly http: HttpClient) {}

  getUsageStats(): Observable<EquipmentUsageStatResource[]> {
    return of([]);
  }

  getEquipments(): Observable<EquipmentResource[]> {
    return this.http.get<EquipmentResource[]>(this.equipUrl);
  }
}
