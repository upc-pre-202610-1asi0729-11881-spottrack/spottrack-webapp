import { BaseResource } from '../../shared/infrastructure/base-response';

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
 * Shape returned by the get-all / verify / end / capture-motion session-tracker
 * endpoints (via SessionTrackerResourceFromEntity on the backend).
 * reservationId is null for walk-up usage (equipment used without a booked
 * reservation) — still real usage data worth tracking.
 */
export interface SessionTrackerResource {
  sessionTrackerId:     string;
  equipmentId:          string;
  reservationId:        string | null;
  continouosActivitiy:  string;
  seconds:              string;
  sessionIsActive:      boolean;
  sessionIsInactive:    boolean;
}
