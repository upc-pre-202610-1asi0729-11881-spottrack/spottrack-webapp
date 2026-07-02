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

@Component({
  selector: 'app-sensor-registration',
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
  templateUrl: './sensor-registration.html',
  styleUrl: './sensor-registration.scss',
})
export class SensorRegistrationComponent {
  private readonly router = inject(Router);
  readonly store = inject(MonitoringStore);
  readonly equipmentStore = inject(EquipmentStore);

  readonly loading = this.store.actionLoading;
  readonly error = this.store.actionError;
  readonly cameraSensors = this.store.cameraSensors;
  readonly motionSensors = this.store.motionSensors;
  readonly equipment = this.equipmentStore.equipment;

  cameraZoneId = '';
  motionEquipmentId: string | null = null;

  submitCamera(): void {
    const zoneId = this.cameraZoneId.trim();
    if (!zoneId) return;
    this.store.registerCameraSensor(zoneId);
    this.cameraZoneId = '';
  }

  submitMotion(): void {
    if (!this.motionEquipmentId) return;
    this.store.registerMotionSensor(this.motionEquipmentId);
    this.motionEquipmentId = null;
  }

  equipmentName(uuid: string): string {
    return this.equipment().find(e => e.uuid === uuid)?.name ?? uuid;
  }

  back(): void {
    this.router.navigate(['/monitoring']);
  }
}
