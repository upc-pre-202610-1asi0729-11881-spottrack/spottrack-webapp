import { Component, computed, signal } from '@angular/core';
import { DecimalPipe }                 from '@angular/common';
import { TranslateModule }             from '@ngx-translate/core';
import { MatIconModule }               from '@angular/material/icon';

// ── Interfaces ────────────────────────────────────────────────────────────────
interface InactivityRow  { machine: string; hours: number; ratePerHour: number; total: number; }
interface MaintenanceType { label: string; amount: number; pct: number; color: string; }
interface RoiMonth        { month: string; cumulative: number; }

// ── Static data ───────────────────────────────────────────────────────────────

/**
 * Labels are intentionally hardcoded — they are technical/domain terms
 * that must NOT go through ngx-translate (per design requirement).
 */
const INACTIVITY_LOSS: InactivityRow[] = [
  { machine: 'Cinta #3',        hours: 48, ratePerHour: 12, total: 576 },
  { machine: 'Elíptica Pro',    hours: 72, ratePerHour:  8, total: 576 },
  { machine: 'Rack Sentadilla', hours: 24, ratePerHour: 15, total: 360 },
  { machine: 'Prensa Piernas',  hours: 36, ratePerHour: 10, total: 360 },
];

const MAINTENANCE_TYPES: MaintenanceType[] = [
  { label: 'financialImpact.costLabels.corrective', amount: 3200, pct: 62, color: '#fb2c36' },
  { label: 'financialImpact.costLabels.preventive', amount: 1100, pct: 21, color: '#00c950' },
  { label: 'financialImpact.costLabels.inventory',  amount:  850, pct: 17, color: '#f5bc36' },
];

const ROI_MONTHS_LABELS = ['Mes 1', 'Mes 2', 'Mes 3', 'Mes 4', 'Mes 5', 'Mes 6', 'Mes 7', 'Mes 8'];

// ── Component ─────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-financial-impact',
  standalone: true,
  imports: [
    DecimalPipe,
    TranslateModule,
    MatIconModule,
  ],
  templateUrl: './financial-impact.html',
  styleUrl:    './financial-impact.scss',
})
export class FinancialImpactComponent {

  // ── Summary stats (could be injected from a service later) ────────────────
  readonly stats = {
    lossInactivity:   1872,
    maintenanceCost:  5150,
    potentialSavings: 1840,
    roiMonths:        7.2,
  };

  // ── Inactivity loss table ─────────────────────────────────────────────────
  readonly inactivityLoss   = INACTIVITY_LOSS;

  readonly totalMonthlyLoss = computed(() =>
    this.inactivityLoss.reduce((sum, row) => sum + row.total, 0)
  );

  // ── Maintenance cost pie ──────────────────────────────────────────────────
  readonly maintenanceTypes = MAINTENANCE_TYPES;

  maintenancePieGradient(): string {
    let cursor = 0;
    return this.maintenanceTypes
      .map(t => {
        const from = cursor;
        cursor += t.pct;
        return `${t.color} ${from}% ${cursor}%`;
      })
      .join(', ');
  }

  // ── ROI Projection chart ──────────────────────────────────────────────────
  readonly simMachineCost    = signal(5000);
  readonly simUnmetDemand    = signal(120);
  readonly simRevenuePerUser = signal(45);

  readonly roiProjectionData = computed((): RoiMonth[] => {
    const cost    = this.simMachineCost();
    const monthly = this.simUnmetDemand() * this.simRevenuePerUser();
    return ROI_MONTHS_LABELS.map((month, i) => ({
      month,
      cumulative: Math.round(-cost + monthly * (i + 1)),
    }));
  });

  readonly roiYAxisLabels = ['6000', '3000', '0', '-3000', '-6000'];
  readonly gridLines      = new Array(7);   // drives @for in template

  private readonly ROI_MIN   = -6000;
  private readonly ROI_RANGE =  12000;      // 6000 - (-6000)

  roiZeroLinePct(): string {
    return `${((0 - this.ROI_MIN) / this.ROI_RANGE) * 100}%`;
  }

  roiBarHeight(value: number): string {
    return `${(Math.abs(value) / this.ROI_RANGE) * 100}%`;
  }

  calculateRoi(): void {
    // Signals are reactive — re-setting a value forces recompute in the template
    this.simMachineCost.set(this.simMachineCost());
  }

  // ── Export actions ────────────────────────────────────────────────────────
  exportCsv(): void {
    const s = this.stats;
    const rows: string[][] = [
      ['SpotTrack — Impacto Financiero', new Date().toLocaleDateString('es-PE')],
      [],
      ['ESTADÍSTICAS GENERALES'],
      ['Pérdida por Inactividad',  `$${s.lossInactivity}`],
      ['Costo Mantenimiento',      `$${s.maintenanceCost}`],
      ['Ahorro Potencial',         `$${s.potentialSavings}`],
      ['ROI Promedio',             `${s.roiMonths} meses`],
      [],
      ['PÉRDIDA POR INACTIVIDAD DE EQUIPOS'],
      ['Máquina', 'Horas', '$/Hora', 'Total'],
      ...this.inactivityLoss.map(r => [r.machine, String(r.hours), `$${r.ratePerHour}`, `$${r.total}`]),
      ['', '', 'TOTAL PÉRDIDA MENSUAL', `$${this.totalMonthlyLoss()}`],
      [],
      ['DESGLOSE DE COSTOS DE MANTENIMIENTO'],
      ['Categoría', 'Monto', 'Porcentaje'],
      ...this.maintenanceTypes.map(t => [t.label, `$${t.amount}`, `${t.pct}%`]),
      [],
      ['PROYECCIÓN ROI'],
      ['Mes', 'ROI Acumulado'],
      ...this.roiProjectionData().map(m => [m.month, `$${m.cumulative}`]),
    ];

    const csv  = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `spottrack-financial-impact-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  generatePdf(): void {
    window.print();
  }
}
