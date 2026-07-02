import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MonitoringStore } from '../../../application/monitoring.store';
import { EquipmentStore } from '../../../../gym/application/equipment.store';

interface AnomalyForm {
  reservationId: string;
  equipmentId: string | null;
  zoneId: string;
  anomalyDescription: string;
}

@Component({
  selector: 'app-anomaly-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './anomaly-report.html',
  styleUrl: './anomaly-report.scss',
})
export class AnomalyReportComponent {
  private readonly router = inject(Router);
  readonly store = inject(MonitoringStore);
  readonly equipmentStore = inject(EquipmentStore);

  readonly loading = this.store.actionLoading;
  readonly error = this.store.actionError;
  readonly anomalyReports = this.store.anomalyReports;
  readonly equipment = this.equipmentStore.equipment;

  form: AnomalyForm = {
    reservationId: '',
    equipmentId: null,
    zoneId: '',
    anomalyDescription: '',
  };

  get isValid(): boolean {
    return !!(
      this.form.reservationId.trim() &&
      this.form.equipmentId &&
      this.form.zoneId.trim() &&
      this.form.anomalyDescription.trim()
    );
  }

  submit(): void {
    if (!this.isValid || !this.form.equipmentId) return;
    this.store.reportAnomaly({
      reservationId: this.form.reservationId.trim(),
      equipmentId: this.form.equipmentId,
      zoneId: this.form.zoneId.trim(),
      anomalyDescription: this.form.anomalyDescription.trim(),
    });
    this.form = { reservationId: '', equipmentId: null, zoneId: '', anomalyDescription: '' };
  }

  equipmentName(uuid: string): string {
    return this.equipment().find(e => e.uuid === uuid)?.name ?? uuid;
  }

  back(): void {
    this.router.navigate(['/monitoring']);
  }
}
