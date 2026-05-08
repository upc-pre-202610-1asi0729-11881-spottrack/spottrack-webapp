// src/app/configuration/domain/model/configuration.entity.ts

export enum AlertType {
  PREVENTIVE_MAINTENANCE = 'PREVENTIVE_MAINTENANCE',
  OFFLINE_SENSORS = 'OFFLINE_SENSORS',
  LOW_BATTERY = 'LOW_BATTERY',
  WEEKLY_REPORTS = 'WEEKLY_REPORTS',
}

export interface MaintenanceThreshold {
  criticalUsageHours: number; // 500
  maxInactiveTime: number; // 15 (minutos)
  peakHoursBuffer: number; // 32 (horas)
}

export interface IoTConfiguration {
  lowBatteryThreshold: number; // 20 (%)
  pingInterval: number; // 10 (segundos)
  offlineGracePeriod: number; // 3 (minutos)
}

export interface FinancialConfiguration {
  costPerHourDowntime: number; // 25 (USD)
  monthlyMembership: number; // 89 (USD)
  systemCurrency: string; // 'USD - Dólar Estadounidense'
}

export interface Configuration {
  maintenanceThresholds: MaintenanceThreshold;
  iotConfig: IoTConfiguration;
  financialConfig: FinancialConfiguration;
  notificationEmail: string;
  enabledAlertTypes: AlertType[];
  intelligentScheduling: boolean;
  lastUpdated?: Date;
}

export interface ConfigurationSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  config: any;
}
