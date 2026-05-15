import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { MaintenanceTicket, TicketStatus, TicketPriority, TicketType } from '../domain/model/maintenance-ticket.entity';
import { MaintenanceTicketResource, MaintenanceTicketResponse } from './maintenance-response';

export class MaintenanceTicketAssembler implements BaseAssembler<MaintenanceTicket, MaintenanceTicketResource, MaintenanceTicketResponse> {
  toEntitiesFromResponse(response: MaintenanceTicketResponse): MaintenanceTicket[] {
    return response.map(r => this.toEntityFromResource(r));
  }

  toEntityFromResource(r: MaintenanceTicketResource): MaintenanceTicket {
    return new MaintenanceTicket({
      id:          r.id,
      equipmentId: r.equipment_id,
      status:      r.status   as TicketStatus,
      priority:    r.priority as TicketPriority,
      type:        r.type     as TicketType,
      createdAt:   r.created_at,
      description: r.description ?? '',
      assignee:    r.assignee    ?? '',
      completedBy: r.completed_by ?? '',
    });
  }

  toResourceFromEntity(e: MaintenanceTicket): MaintenanceTicketResource {
    return {
      id:           e.id,
      equipment_id: e.equipmentId,
      status:       e.status,
      priority:     e.priority,
      type:         e.type,
      created_at:   e.createdAt,
      description:  e.description,
      assignee:     e.assignee || null,
      completed_by: e.completedBy || null,
    };
  }
}
