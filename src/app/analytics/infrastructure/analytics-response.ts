import { BaseResource } from '../../shared/infrastructure/base-response';

/**
 * Shape for GET /equipment-usage-stats. Not yet exposed by the real backend
 * (spottrack-platform-os) as of 2026-06-20 — AnalyticsApi.getUsageStats() and
 * FinancialImpactApi.getUsageStats() stub this with an empty array until the
 * endpoint ships. Keep this contract in sync with the backend resource once
 * it's confirmed available.
 */
export interface EquipmentUsageStatResource extends BaseResource {
  id:                   number;
  equipment_id:         number;
  total_usage_hours:    number;
  usage_count_daily:    number;
  estimated_wear_level: number;
}

export type EquipmentUsageStatResponse = EquipmentUsageStatResource[];

/**
 * Shape returned by GET /equipments — mirrors gym/infrastructure/equipment-response.ts,
 * the verified contract for the same live endpoint (see gym/EquipmentAssembler).
 */
export interface EquipmentResource extends BaseResource {
  id:                    number;
  equipmentId:           string;
  equipmentName:         string;
  model:                 string;
  status:                string;
  zoneId:                string;
  manufacturerId:        string;
  purchaseCurrency:      string;
  purchaseAmount:        number;
  maintenanceThreshold?: string;
}

export type EquipmentResponse = EquipmentResource[];
