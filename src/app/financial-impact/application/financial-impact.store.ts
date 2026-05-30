import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { FinancialApi } from '../infrastructure/financial-api';
import {
  EquipmentUsageStatResource,
  EquipmentResource,
  MaintenanceTicketResource,
  MaintenanceLogResource,
  SparePartResource,
} from '../infrastructure/financial-response';

export interface InactivityRow   { machine: string; hours: number; ratePerHour: number; total: number; }
export interface MaintenanceTypeRow { label: string; amount: number; pct: number; color: string; }
export interface FinancialStats  {
  lossInactivity:   number;
  maintenanceCost:  number;
  potentialSavings: number;
  roiMonths:        number;
}

@Injectable({ providedIn: 'root' })
export class FinancialImpactStore {

  private readonly api        = inject(FinancialApi);
  private readonly destroyRef = inject(DestroyRef);

  // ── Raw signals ───────────────────────────────────────────────────────────
  private readonly _usageStats  = signal<EquipmentUsageStatResource[]>([]);
  private readonly _equipments  = signal<EquipmentResource[]>([]);
  private readonly _tickets     = signal<MaintenanceTicketResource[]>([]);
  private readonly _logs        = signal<MaintenanceLogResource[]>([]);
  private readonly _spareParts  = signal<SparePartResource[]>([]);
  private readonly _loading     = signal(false);
  private readonly _error       = signal<string | null>(null);

  readonly loading = this._loading.asReadonly();
  readonly error   = this._error.asReadonly();

  // ── Inactivity loss: equipment in MAINTENANCE status → estimated revenue loss ──
  readonly inactivityLoss = computed<InactivityRow[]>(() => {
    const equips = this._equipments();
    const stats  = this._usageStats();
    return equips
      .filter(e => e.status === 'MAINTENANCE')
      .map(e => {
        const stat        = stats.find(s => s.equipment_id === e.id);
        const dailyCount  = stat?.usage_count_daily ?? 0;
        const hours       = Math.max(24, Math.round(72 - dailyCount * 8));
        const ratePerHour = Math.max(5, Math.round(e.purchase_price / 500));
        return { machine: e.name, hours, ratePerHour, total: hours * ratePerHour };
      });
  });

  readonly totalMonthlyLoss = computed(() =>
    this.inactivityLoss().reduce((sum, row) => sum + row.total, 0)
  );

  // ── Maintenance cost breakdown from tickets + logs + spare parts ──────────
  readonly maintenanceTypes = computed<MaintenanceTypeRow[]>(() => {
    const tickets = this._tickets();
    const logs    = this._logs();
    const parts   = this._spareParts();

    if (!tickets.length && !parts.length) return [];

    const costOf = (ticketId: number) =>
      logs.filter(l => l.ticket_id === ticketId).reduce((s, l) => s + l.cost, 0);

    const corrective = tickets
      .filter(t => t.type === 'CORRECTIVE')
      .reduce((s, t) => s + costOf(t.id), 0);

    const preventive = tickets
      .filter(t => t.type === 'PREVENTIVE')
      .reduce((s, t) => s + costOf(t.id), 0);

    const inventory = parts.reduce((s, p) => s + p.stock_quantity * p.unit_cost, 0);

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
      .map(t => {
        const from = cursor;
        cursor += t.pct;
        return `${t.color} ${from}% ${cursor}%`;
      })
      .join(', ');
  }

  // ── Summary financial stats ───────────────────────────────────────────────
  readonly financialStats = computed<FinancialStats>(() => {
    const lossInactivity  = this.totalMonthlyLoss();
    const maintenanceCost = this.maintenanceTypes().reduce((s, t) => s + t.amount, 0);
    const potentialSavings = Math.round((lossInactivity + maintenanceCost) * 0.30);
    const monthlyBenefit   = Math.max(1, Math.round((lossInactivity * 0.3 + maintenanceCost * 0.05)));
    const sysImplCost      = Math.round(maintenanceCost * 0.6);
    const roiMonths        = Math.round((sysImplCost / monthlyBenefit) * 10) / 10;
    return { lossInactivity, maintenanceCost, potentialSavings, roiMonths };
  });

  // ── Constructor: load data ────────────────────────────────────────────────
  constructor() {
    this.load();
  }

  private load(): void {
    this._loading.set(true);
    this._error.set(null);

    forkJoin({
      stats:      this.api.getUsageStats(),
      equipments: this.api.getEquipments(),
      tickets:    this.api.getMaintenanceTickets(),
      logs:       this.api.getMaintenanceLogs(),
      spareParts: this.api.getSpareParts(),
    })
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: ({ stats, equipments, tickets, logs, spareParts }) => {
        this._usageStats.set(stats);
        this._equipments.set(equipments);
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
