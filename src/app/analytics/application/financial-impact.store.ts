import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FinancialImpactApi } from '../infrastructure/financial-impact-api';
import {
  MaintenanceTicketResource,
  MaintenanceLogResource,
  SparePartResource,
} from '../infrastructure/financial-impact-response';
import { FinancialStat } from '../domain/model/financial-impact.entity';

export interface InactivityRow      { machine: string; hours: number; ratePerHour: number; total: number; }
export interface MaintenanceTypeRow { label: string; amount: number; pct: number; color: string; }
export interface FinancialStats     {
  lossInactivity:   number;
  maintenanceCost:  number;
  potentialSavings: number;
  roiMonths:        number;
}

@Injectable({ providedIn: 'root' })
export class FinancialImpactStore {

  private readonly api        = inject(FinancialImpactApi);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _financialStats = signal<FinancialStat[]>([]);
  private readonly _tickets        = signal<MaintenanceTicketResource[]>([]);
  private readonly _logs           = signal<MaintenanceLogResource[]>([]);
  private readonly _spareParts     = signal<SparePartResource[]>([]);
  private readonly _loading        = signal(false);
  private readonly _error          = signal<string | null>(null);

  readonly loading = this._loading.asReadonly();
  readonly error   = this._error.asReadonly();

  readonly inactivityLoss = computed<InactivityRow[]>(() => {
    return this._financialStats()
      .filter(s => s.status === 'MAINTENANCE')
      .map(s => {
        const hours       = Math.max(24, Math.round(72 - s.usageCountDaily * 8));
        const ratePerHour = Math.max(5, Math.round(s.purchasePrice / 500));
        return { machine: s.equipmentName, hours, ratePerHour, total: hours * ratePerHour };
      });
  });

  readonly totalMonthlyLoss = computed(() =>
    this.inactivityLoss().reduce((sum, row) => sum + row.total, 0)
  );

  readonly maintenanceTypes = computed<MaintenanceTypeRow[]>(() => {
    const tickets = this._tickets();
    const logs    = this._logs();
    const parts   = this._spareParts();

    if (!tickets.length && !parts.length) return [];

    const costOf = (ticketId: number) =>
      logs.filter(l => l.ticket_id === ticketId).reduce((s, l) => s + l.cost, 0);

    const corrective = tickets.filter(t => t.type === 'CORRECTIVE').reduce((s, t) => s + costOf(t.id), 0);
    const preventive = tickets.filter(t => t.type === 'PREVENTIVE').reduce((s, t) => s + costOf(t.id), 0);
    const inventory  = parts.reduce((s, p) => s + p.stock_quantity * p.unit_cost, 0);

    const total = corrective + preventive + inventory || 1;
    return [
      { label: 'financialImpact.costLabels.corrective', amount: corrective, pct: Math.round((corrective / total) * 100), color: '#fb2c36' },
      { label: 'financialImpact.costLabels.preventive', amount: preventive, pct: Math.round((preventive / total) * 100), color: '#00c950' },
      { label: 'financialImpact.costLabels.inventory',  amount: inventory,  pct: Math.round((inventory  / total) * 100), color: '#f5bc36' },
    ];
  });

  financialPieGradient(): string {
    let cursor = 0;
    return this.maintenanceTypes()
      .map(t => { const from = cursor; cursor += t.pct; return `${t.color} ${from}% ${cursor}%`; })
      .join(', ');
  }

  readonly financialStats = computed<FinancialStats>(() => {
    const lossInactivity   = this.totalMonthlyLoss();
    const maintenanceCost  = this.maintenanceTypes().reduce((s, t) => s + t.amount, 0);
    const potentialSavings = Math.round((lossInactivity + maintenanceCost) * 0.30);
    const monthlyBenefit   = Math.max(1, Math.round((lossInactivity * 0.3 + maintenanceCost * 0.05)));
    const sysImplCost      = Math.round(maintenanceCost * 0.6);
    const roiMonths        = Math.round((sysImplCost / monthlyBenefit) * 10) / 10;
    return { lossInactivity, maintenanceCost, potentialSavings, roiMonths };
  });

  constructor() { this.load(); }

  private load(): void {
    this._loading.set(true);
    this._error.set(null);

    this.api.getFinancialImpactData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ stats, tickets, logs, spareParts }) => {
          this._financialStats.set(stats);
          this._tickets.set(tickets);
          this._logs.set(logs);
          this._spareParts.set(spareParts);
          this._loading.set(false);
        },
        error: (err: unknown) => {
          this._error.set(err instanceof Error ? err.message : 'Error al cargar datos financieros');
          this._loading.set(false);
        },
      });
  }
}
