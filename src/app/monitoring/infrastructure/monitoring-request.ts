export interface RegisterCameraSensorRequest {
  equipmentId: string;
}

export interface RegisterMotionSensorRequest {
  equipmentId: string;
}

export interface CaptureCameraMotionRequest {
  sessionTrackerId: string;
  movementDetectedViaVideo: boolean;
}

export interface CaptureMotionSensorReadingRequest {
  sessionTrackerId: string;
  movementDetectedViaSensor: boolean;
}

export interface ReportAnomalyRequest {
  reservationId: string;
  equipmentId: string;
  zoneId: string;
  anomalyDescription: string;
}

export interface CreateSessionTrackerRequest {
  sessionTrackerId: string;
  reservationId: string;
  sessionIsActive: boolean;
  sessionIsInactive: boolean;
  seconds: string;
  continuousActivity: string;
}
