import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { FinancialStat } from '../domain/model/financial-impact.entity';
import { FinancialImpactApiEndpoint } from './financial-impact-api-endpoint';
import { FinancialImpactAssembler } from './financial-impact-assembler';
import { MaintenanceTicketResource, MaintenanceLogResource, SparePartResource } from './financial-impact-response';

export interface FinancialImpactData {
  stats:      FinancialStat[];
  tickets:    MaintenanceTicketResource[];
  logs:       MaintenanceLogResource[];
  spareParts: SparePartResource[];
}

@Injectable({ providedIn: 'root' })
export class FinancialImpactApi {
  private readonly endpoint:  FinancialImpactApiEndpoint;
  private readonly assembler = new FinancialImpactAssembler();

  constructor(private readonly http: HttpClient) {
    this.endpoint = new FinancialImpactApiEndpoint(http);
  }

  /**
   * Fetches equipments + usage stats + maintenance data in one round trip.
   * Equipment/usage-stat resources are joined into FinancialStat entities;
   * tickets/logs/spare-parts stay raw since there's no domain entity for
   * them yet.
   */
  getFinancialImpactData(): Observable<FinancialImpactData> {
    return forkJoin({
      equipments: this.endpoint.getEquipments(),
      usageStats: this.endpoint.getUsageStats(),
      tickets:    this.endpoint.getMaintenanceTickets(),
      logs:       this.endpoint.getMaintenanceLogs(),
      spareParts: this.endpoint.getSpareParts(),
    }).pipe(
      map(({ equipments, usageStats, tickets, logs, spareParts }) => ({
        stats: this.assembler.toEntitiesFromResources(equipments, usageStats),
        tickets,
        logs,
        spareParts,
      }))
    );
  }
}
