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

export interface CameraSensorResource extends BaseResource {
  id:              number;
  cameraSensorId:  string;
  equipmentId:     string;
  equipmentName:   string | null;
  equipmentModel:  string | null;
  equipmentStatus: string | null;
  registeredAt:    string;
}

export interface MotionSensorResource extends BaseResource {
  id:              number;
  motionSensorId:  string;
  equipmentId:     string;
  equipmentName:   string | null;
  equipmentModel:  string | null;
  equipmentStatus: string | null;
  registeredAt:    string;
}

export interface AnomalyResource extends BaseResource {
  id:                 number;
  anomalyId:          string;
  reservationId:      string;
  equipmentId:        string;
  zoneId:             string;
  anomalyDescription: string;
  emissionDate:       string;
}

/**
 * Shape returned by the verify / end / capture-motion session-tracker
 * endpoints (via SessionTrackerResourceFromEntity on the backend).
 */
export interface SessionTrackerResource {
  sessionTrackerId:     string;
  reservationId:        string;
  continouosActivitiy:  string;
  seconds:              string;
  sessionIsActive:      boolean;
  sessionIsInactive:    boolean;
}

/**
 * The create-session-tracker endpoint returns the raw persistence entity
 * instead of a SessionTrackerResource (a pre-existing backend inconsistency),
 * so its JSON shape differs slightly — modeled here separately.
 */
export interface SessionTrackerCreatedResource {
  id:                  number;
  sessionTrackerId:    string;
  reservationId:       string;
  continuousActivity:  string;
  seconds:             string;
  sessionIsActive:     boolean;
  sessionIsInactive:   boolean;
  lastActivityAt:      string | null;
}
