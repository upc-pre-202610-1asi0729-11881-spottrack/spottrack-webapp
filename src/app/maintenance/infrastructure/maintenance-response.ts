import { BaseResource } from '../../shared/infrastructure/base-response';

export interface MaintenanceTicketResource extends BaseResource {
  id:           number;
  equipment_id: number;
  status:       string;
  priority:     string;
  type:         string;
  created_at:   string;
  description:  string;
  assignee:     string | null;
  completed_by: string | null;
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
