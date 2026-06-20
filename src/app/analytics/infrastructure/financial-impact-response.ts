import { BaseResource } from '../../shared/infrastructure/base-response';

export interface EquipmentUsageStatResource extends BaseResource {
  id:                   number;
  equipment_id:         number;
  total_usage_hours:    number;
  usage_count_daily:    number;
  estimated_wear_level: number;
}

export type EquipmentUsageStatResponse = EquipmentUsageStatResource[];

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

export interface MaintenanceTicketResource extends BaseResource {
  id:           number;
  equipment_id: number;
  status:       string;
  priority:     string;
  type:         'CORRECTIVE' | 'PREVENTIVE';
  created_at:   string;
  description:  string;
}

export type MaintenanceTicketResponse = MaintenanceTicketResource[];

export interface MaintenanceLogResource extends BaseResource {
  id:                 number;
  ticket_id:          number;
  action_description: string;
  cost:               number;
  completed_at:       string;
}

export type MaintenanceLogResponse = MaintenanceLogResource[];

export interface SparePartResource extends BaseResource {
  id:             number;
  gym_id:         number;
  part_name:      string;
  stock_quantity: number;
  unit_cost:      number;
}

export type SparePartResponse = SparePartResource[];
