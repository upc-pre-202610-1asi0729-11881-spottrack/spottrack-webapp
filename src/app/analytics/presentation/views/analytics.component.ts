import { Component, computed, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

interface HourlyPoint  { hour: string; occupancy: number; }
interface WeekDay      { day: string; usage: number; prevUsage: number; }
interface RelocationRec {
  machine: string; fromBranch: string; fromOccupancy: number;
  toBranch: string; toOccupancy: number; savingsPerMonth: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

const WEEKLY_DATA: WeekDay[] = [
  { day: 'Lun', usage: 350, prevUsage: 300 },
  { day: 'Mar', usage: 420, prevUsage: 370 },
  { day: 'Mié', usage: 380, prevUsage: 340 },
  { day: 'Jue', usage: 460, prevUsage: 400 },
  { day: 'Vie', usage: 520, prevUsage: 450 },
  { day: 'Sáb', usage: 480, prevUsage: 420 },
  { day: 'Dom', usage: 290, prevUsage: 260 },
];

const HOURLY_DATA: HourlyPoint[] = [
  { hour: '06:00', occupancy: 45 },
  { hour: '07:00', occupancy: 72 },
  { hour: '08:00', occupancy: 88 },
  { hour: '09:00', occupancy: 95 },
  { hour: '10:00', occupancy: 60 },
  { hour: '12:00', occupancy: 35 },
  { hour: '18:00', occupancy: 78 },
  { hour: '19:00', occupancy: 95 },
  { hour: '20:00', occupancy: 91 },
  { hour: '21:00', occupancy: 65 },
];

const BRANCH_STATS: Record<string, {
  totalHours: number; hoursChange: number;
  occupancy: number; occupancyChange: number;
  peak: number; peakTime: string;
  inactive: number; inactiveChange: number;
}> = {
  all:  { totalHours: 3245, hoursChange: 12, occupancy: 78, occupancyChange: 5,  peak: 95, peakTime: '19:00 - 20:00', inactive: 124, inactiveChange: -8 },
  main: { totalHours: 1820, hoursChange: 8,  occupancy: 82, occupancyChange: 3,  peak: 95, peakTime: '19:00 - 20:00', inactive:  68, inactiveChange: -5 },
};

const RELOCATION_DATA: RelocationRec[] = [
  { machine: 'Cinta Cardio 3',   fromBranch: 'Sede Miraflores', fromOccupancy: 23, toBranch: 'Sede San Isidro', toOccupancy: 94, savingsPerMonth: 1200, priority: 'HIGH'   },
  { machine: 'Bicicleta Est. 2', fromBranch: 'Sede Barranco',   fromOccupancy: 31, toBranch: 'Sede Surco',      toOccupancy: 88, savingsPerMonth: 800,  priority: 'MEDIUM' },
  { machine: 'Elíptica Elite',   fromBranch: 'Sede La Molina',  fromOccupancy: 18, toBranch: 'Sede Miraflores', toOccupancy: 91, savingsPerMonth: 950,  priority: 'HIGH'   },
  { machine: 'Remo Concept 2',   fromBranch: 'Sede Barranco',   fromOccupancy: 42, toBranch: 'Sede San Isidro', toOccupancy: 87, savingsPerMonth: 650,  priority: 'MEDIUM' },
];

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    DecimalPipe,
    ReactiveFormsModule,
    TranslateModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './analytics.component.html',
  styleUrl:    './analytics.component.scss',
})
export class AnalyticsComponent {
  // ── Filters ──────────────────────────────────────────────────────────────
  readonly selectedPeriod = signal<'month' | 'quarter' | 'year'>('month');
  readonly selectedBranch = signal<'all' | 'main'>('all');
  readonly showComparison = signal(false);

  readonly dateRange = new FormGroup({
    start: new FormControl<Date | null>(null),
    end:   new FormControl<Date | null>(null),
  });

  // ── Stats ─────────────────────────────────────────────────────────────────
  readonly stats = computed(() => BRANCH_STATS[this.selectedBranch()]);

  // ── Bar chart ─────────────────────────────────────────────────────────────
  readonly maxCapacity = 600;
  readonly weeklyData  = WEEKLY_DATA;

  barPct(value: number):  string { return `${(value / this.maxCapacity) * 100}%`; }
  capacityPct():          string { return `${(500 / this.maxCapacity) * 100}%`; }

  // ── Pie chart ─────────────────────────────────────────────────────────────
  readonly machineTypes = [
    { label: 'Cardio',    pct: 45, color: '#f5bc36' },
    { label: 'Fuerza',    pct: 35, color: '#00ccb2' },
    { label: 'Funcional', pct: 20, color: '#22c55e' },
  ];

  pieGradient(): string {
    let cur = 0;
    return this.machineTypes.map(t => {
      const start = cur; cur += t.pct;
      return `${t.color} ${start}% ${cur}%`;
    }).join(', ');
  }

  // ── Line chart (SVG) ──────────────────────────────────────────────────────
  readonly hourlyData    = HOURLY_DATA;
  private readonly SVG_W = 1160;
  private readonly SVG_H = 200;

  readonly linePoints = computed(() =>
    this.hourlyData.map((d, i) => ({
      x: (i / (this.hourlyData.length - 1)) * this.SVG_W,
      y: this.SVG_H - (d.occupancy / 100) * this.SVG_H,
      ...d,
    }))
  );

  readonly polylinePoints = computed(() =>
    this.linePoints().map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  );

  readonly areaPath = computed(() => {
    const pts = this.linePoints();
    return `M${pts[0].x},${this.SVG_H} ${pts.map(p => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')} L${pts[pts.length - 1].x},${this.SVG_H} Z`;
  });

  readonly threshold90Y = this.SVG_H - 0.9 * this.SVG_H;

  // ── Relocation recommendations (US-27) ───────────────────────────────────
  readonly relocationData = RELOCATION_DATA;

  // ── Actions ───────────────────────────────────────────────────────────────
  exportCsv(): void {
    const s = this.stats();
    const rows: string[][] = [
      ['SpotTrack Analytics Export', new Date().toLocaleDateString('es-PE')],
      [],
      ['ESTADÍSTICAS GENERALES'],
      ['Horas Totales de Uso', `${s.totalHours}h`, `${s.hoursChange > 0 ? '+' : ''}${s.hoursChange}% vs mes anterior`],
      ['Tasa de Ocupación',    `${s.occupancy}%`,  `${s.occupancyChange > 0 ? '+' : ''}${s.occupancyChange}% vs mes anterior`],
      ['Pico Máximo',          `${s.peak}%`,        s.peakTime],
      ['Tiempo Inactivo',      `${s.inactive}h`,   `${s.inactiveChange}% vs mes anterior`],
      [],
      ['USO SEMANAL'],
      ['Día', 'Uso (h)', 'Mes Anterior (h)', 'Capacidad (h)'],
      ...this.weeklyData.map(d => [d.day, String(d.usage), String(d.prevUsage), '500']),
      [],
      ['PICOS DE OCUPACIÓN POR HORA'],
      ['Hora', 'Ocupación (%)'],
      ...this.hourlyData.map(d => [d.hour, String(d.occupancy)]),
      [],
      ['RECOMENDACIONES DE REUBICACIÓN'],
      ['Máquina', 'Sede Origen', 'Ocupación Origen (%)', 'Sede Destino', 'Ocupación Destino (%)', 'Ahorro Estimado/mes', 'Prioridad'],
      ...this.relocationData.map(r => [
        r.machine, r.fromBranch, String(r.fromOccupancy),
        r.toBranch, String(r.toOccupancy), `$${r.savingsPerMonth}`, r.priority,
      ]),
    ];

    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `spottrack-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  generatePdf(): void {
    window.print();
  }
}
