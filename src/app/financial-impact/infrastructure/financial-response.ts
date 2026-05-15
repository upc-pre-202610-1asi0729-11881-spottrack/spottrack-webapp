import { BaseResource } from '../../shared/infrastructure/base-response';

/** Shape returned by GET /equipment_usage_stats */
export interface EquipmentUsageStatResource extends BaseResource {
  id:                   number;
  equipment_id:         number;
  total_usage_hours:    number;
  usage_count_daily:    number;
  estimated_wear_level: number;
}

export type EquipmentUsageStatResponse = EquipmentUsageStatResource[];

/** Shape returned by GET /equipments */
export interface EquipmentResource extends BaseResource {
  id:             number;
  zone_id:        number;
  name:           string;
  brand:          string;
  model:          string;
  purchase_price: number;
  status:         string;
}

export type EquipmentResponse = EquipmentResource[];
