import { BaseResource } from '../../shared/infrastructure/base-response';

export interface SensorSessionResource extends BaseResource {
  id:               number;
  equipment_id:     number;
  start_time:       string;
  end_time:         string | null;
  anomaly_detected: boolean;
  anomaly_type:     string | null;
}

export type SensorSessionResponse = SensorSessionResource[];

export interface SensorReadingResource extends BaseResource {
  id:         number;
  session_id: number;
  value:      number;
  unit:       string;
  timestamp:  string;
}

export type SensorReadingResponse = SensorReadingResource[];
