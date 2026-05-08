// src/app/configuration/application/configuration.store.ts

import { Injectable, computed, inject, signal } from '@angular/core';
import { 
  Configuration, 
  MaintenanceThreshold, 
  IoTConfiguration, 
  FinancialConfiguration,
  AlertType 
} from '../domain/model/configuration.entity';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationStore {
  
  // ─── State ───────────────────────────────────────────────────────────────────
  private maintenanceThresholds = signal<MaintenanceThreshold>({
    criticalUsageHours: 500,
    maxInactiveTime: 15,
    peakHoursBuffer: 32,
  });

  private iotConfig = signal<IoTConfiguration>({
    lowBatteryThreshold: 20,
    pingInterval: 10,
    offlineGracePeriod: 3,
  });

  private financialConfig = signal<FinancialConfiguration>({
    costPerHourDowntime: 25,
    monthlyMembership: 89,
    systemCurrency: 'USD - Dólar Estadounidense',
  });

  private notificationEmail = signal('admin@spottrack.com');
  private enabledAlertTypes = signal<AlertType[]>(Object.values(AlertType));
  private intelligentScheduling = signal(true);
  private loading = signal(false);
  private isDirty = signal(false);

  // ─── Public selectors ────────────────────────────────────────────────────────
  readonly maintenanceThresholds$ = this.maintenanceThresholds.asReadonly();
  readonly iotConfig$ = this.iotConfig.asReadonly();
  readonly financialConfig$ = this.financialConfig.asReadonly();
  readonly notificationEmail$ = this.notificationEmail.asReadonly();
  readonly enabledAlertTypes$ = this.enabledAlertTypes.asReadonly();
  readonly intelligentScheduling$ = this.intelligentScheduling.asReadonly();
  readonly loading$ = this.loading.asReadonly();
  readonly isDirty$ = this.isDirty.asReadonly();

  // ─── Computed values ─────────────────────────────────────────────────────────
  readonly configuration = computed<Configuration>(() => ({
    maintenanceThresholds: this.maintenanceThresholds(),
    iotConfig: this.iotConfig(),
    financialConfig: this.financialConfig(),
    notificationEmail: this.notificationEmail(),
    enabledAlertTypes: this.enabledAlertTypes(),
    intelligentScheduling: this.intelligentScheduling(),
    lastUpdated: new Date(),
  }));

  // ─── Actions ─────────────────────────────────────────────────────────────────
  updateMaintenanceThresholds(thresholds: Partial<MaintenanceThreshold>): void {
    this.maintenanceThresholds.update(current => ({ ...current, ...thresholds }));
    this.isDirty.set(true);
  }

  updateIoTConfig(config: Partial<IoTConfiguration>): void {
    this.iotConfig.update(current => ({ ...current, ...config }));
    this.isDirty.set(true);
  }

  updateFinancialConfig(config: Partial<FinancialConfiguration>): void {
    this.financialConfig.update(current => ({ ...current, ...config }));
    this.isDirty.set(true);
  }

  setNotificationEmail(email: string): void {
    this.notificationEmail.set(email);
    this.isDirty.set(true);
  }

  setEnabledAlertTypes(types: AlertType[]): void {
    this.enabledAlertTypes.set(types);
    this.isDirty.set(true);
  }

  setIntelligentScheduling(enabled: boolean): void {
    this.intelligentScheduling.set(enabled);
    this.isDirty.set(true);
  }

  async saveConfiguration(): Promise<void> {
    this.loading.set(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      this.isDirty.set(false);
    } finally {
      this.loading.set(false);
    }
  }

  async reloadConfiguration(): Promise<void> {
    this.loading.set(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      // Reset to default values (in production, fetch from API)
      this.maintenanceThresholds.set({
        criticalUsageHours: 500,
        maxInactiveTime: 15,
        peakHoursBuffer: 32,
      });
      this.isDirty.set(false);
    } finally {
      this.loading.set(false);
    }
  }

  resetChanges(): void {
    this.isDirty.set(false);
  }
}
