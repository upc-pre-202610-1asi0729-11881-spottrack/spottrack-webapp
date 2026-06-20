import { MaintenanceTicket, TicketStatus, TicketPriority, TicketType } from '../domain/model/maintenance-ticket.entity';
import { MaintenanceTicketResource } from './maintenance-response';

export class MaintenanceTicketAssembler {
  toEntityFromResource(r: MaintenanceTicketResource): MaintenanceTicket {
    return new MaintenanceTicket({
      id:          Number(r.id),
      equipmentId: Number(r.equipmentId),
      status:      (r.status as TicketStatus) || TicketStatus.OPEN,
      priority:    TicketPriority.LOW,
      type:        TicketType.CORRECTIVE,
      createdAt:   '',
      description: '',
      assignee:    '',
      completedBy: '',
    });
  }

  toResourceFromEntity(e: MaintenanceTicket): MaintenanceTicketResource {
    return {
      id:            String(e.id),
      equipmentId:   String(e.equipmentId),
      status:        e.status,
      ticketId:      '',
      maintenanceId: '',
    };
  }
}
