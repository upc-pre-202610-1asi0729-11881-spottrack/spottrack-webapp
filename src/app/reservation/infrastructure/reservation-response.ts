import { BaseResource } from '../../shared/infrastructure/base-response';

export interface ReservationResource extends BaseResource {
  id:               number;
  machine_id:       string;
  machine_name:     string;
  start_time:       string;
  duration_seconds: number;
  status:           'active' | 'expired' | 'cancelled';
}

export type ReservationResponse = ReservationResource[];
