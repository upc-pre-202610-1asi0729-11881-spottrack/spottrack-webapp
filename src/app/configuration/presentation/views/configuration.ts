import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSliderModule } from '@angular/material/slider';
import { TranslatePipe } from '@ngx-translate/core'; // <-- 1. Agregado el import

export interface AlertType {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
}

@Component({
  selector: 'app-configuration',
  standalone: true,
  // <-- 2. Agregado MatSliderModule al arreglo de imports
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatSnackBarModule,
    MatSliderModule,
    TranslatePipe,
  ],
  templateUrl: './configuration.html',
  styleUrl: './configuration.scss',
})
export class ConfigurationComponent {
  // ── Maintenance Thresholds ──────────────────────────────────────────────
  criticalHours = 500;
  maxIdleMinutes = 15;
  peakBuffer = 2;

  // ── IoT Configuration ───────────────────────────────────────────────────
  batteryThreshold = 20;
  pingInterval = '10';
  offlineGraceMinutes = 3;

  // ── Notifications ───────────────────────────────────────────────────────
  notificationEmail = 'admin@spottrack.com';

  alertTypes: AlertType[] = [
    {
      key: 'preventive_maintenance',
      name: 'Mantenimiento Preventivo',
      description: 'Umbral de horas alcanzado',
      enabled: true,
    },
    {
      key: 'sensors_offline',
      name: 'Sensores Offline',
      description: 'Conectividad perdida',
      enabled: true,
    },
    {
      key: 'low_battery',
      name: 'Batería Baja',
      description: 'Nivel crítico en sensores',
      enabled: true,
    },
    {
      key: 'weekly_reports',
      name: 'Reportes Semanales',
      description: 'Resumen de actividad',
      enabled: true,
    },
  ];

  // ── Financial Configuration ─────────────────────────────────────────────
  downtimeCostPerHour = 25;
  avgMonthlyMembership = 89;
  systemCurrency = 'USD';

  constructor(private snackBar: MatSnackBar) {}

  onSave(): void {
    this.snackBar.open('Configuración guardada correctamente', 'Cerrar', {
      duration: 3000,
    });
  }

  onCancel(): void {
    this.snackBar.open('Cambios descartados', 'Cerrar', {
      duration: 2000,
    });
  }
}
