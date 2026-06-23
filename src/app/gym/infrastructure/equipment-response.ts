import { BaseResource } from '../../shared/infrastructure/base-response';

export interface EquipmentResource extends BaseResource {
  id:                    number;
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
