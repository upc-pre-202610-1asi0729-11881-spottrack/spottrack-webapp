import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AnalyticsStore } from '../../application/analytics.store';

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
    MatProgressSpinnerModule,
  ],
  templateUrl: './analytics.component.html',
  styleUrl:    './analytics.component.scss',
})
export class AnalyticsComponent {

  readonly store = inject(AnalyticsStore);

  // ── Filters local al componente ───────────────────────────────────────────
  readonly selectedPeriod = signal<'month' | 'quarter' | 'year'>('month');
  readonly showComparison = signal(false);

  readonly dateRange = new FormGroup({
    start: new FormControl<Date | null>(null),
    end:   new FormControl<Date | null>(null),
  });

  // ── Bar chart helpers ─────────────────────────────────────────────────────
  barPct(value: number): string {
    const max = this.store.maxCapacity();
    return `${(value / max) * 100}%`;
  }

  capacityPct(): string {
    return `85%`;
  }

  // ── CSV export ────────────────────────────────────────────────────────────
  exportCsv(): void {
    const s = this.store.stats();
    const rows: string[][] = [
      ['SpotTrack Analytics Export', new Date().toLocaleDateString('es-PE')],
      [],
      ['ESTADISTICAS GENERALES'],
      ['Horas Totales de Uso', `${s.totalHours}h`, `${s.hoursChange > 0 ? '+' : ''}${s.hoursChange}% vs mes anterior`],
      ['Tasa de Ocupacion', `${s.occupancy}%`, `${s.occupancyChange > 0 ? '+' : ''}${s.occupancyChange}% vs mes anterior`],
      ['Pico Maximo', `${s.peak}%`, s.peakTime],
      ['Tiempo Inactivo', `${s.inactive}h`, `${s.inactiveChange}% vs mes anterior`],
      [],
      ['USO SEMANAL'],
      ['Dia', 'Uso (h)', 'Mes Anterior (h)', 'Capacidad (h)'],
      ...this.store.weeklyData().map(d => [d.day, String(d.usage), String(d.prevUsage), String(this.store.maxCapacity())]),
      [],
      ['PICOS DE OCUPACION POR HORA'],
      ['Hora', 'Ocupacion (%)'],
      ...this.store.hourlyData().map(d => [d.hour, String(d.occupancy)]),
      [],
      ['RECOMENDACIONES DE REUBICACION'],
      ['Maquina', 'Sede Origen', 'Ocupacion Origen (%)', 'Sede Destino', 'Ocupacion Destino (%)', 'Ahorro Estimado/mes', 'Prioridad'],
      ...this.store.relocationData().map(r => [
        r.machine, r.fromBranch, String(r.fromOccupancy),
        r.toBranch, String(r.toOccupancy), `$${r.savingsPerMonth}`, r.priority,
      ]),
    ];

    const csv  = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
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
