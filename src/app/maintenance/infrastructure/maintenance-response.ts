import { BaseResource } from '../../shared/infrastructure/base-response';

export interface MaintenanceTicketResource {
  id:            string;
  equipmentId:   string;
  status:        string;
  ticketId:      string;
  maintenanceId: string;
}

export type MaintenanceTicketResponse = MaintenanceTicketResource[];

export interface MaintenanceScheduleResource extends BaseResource {
  id:             number;
  equipment_id:   number;
  scheduled_date: string;
  scheduled_time: string;
  task_type:      string;
  notes:          string;
  status:         string;
}

export type MaintenanceScheduleResponse = MaintenanceScheduleResource[];
