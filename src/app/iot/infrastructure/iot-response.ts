import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

export interface IotResource extends BaseResource {
  id:               number;
  equipment_id:     number;
  mac_address:      string;
  status:           string;
  last_heartbeat:   string;
  location:         string;
  battery_level:    number;
  signal_strength:  number;
  firmware_version: string;
}

export type IotResponse = IotResource[];
