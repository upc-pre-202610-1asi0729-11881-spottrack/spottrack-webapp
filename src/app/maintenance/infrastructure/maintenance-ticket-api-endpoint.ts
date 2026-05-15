import { HttpClient } from '@angular/common/http';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { MaintenanceTicket } from '../domain/model/maintenance-ticket.entity';
import { MaintenanceTicketResource, MaintenanceTicketResponse } from './maintenance-response';
import { MaintenanceTicketAssembler } from './maintenance-ticket-assembler';
import { environment } from '../../../environments/environment';

export class MaintenanceTicketApiEndpoint extends BaseApiEndpoint<
  MaintenanceTicket,
  MaintenanceTicketResource,
  MaintenanceTicketResponse,
  MaintenanceTicketAssembler
> {
  constructor(http: HttpClient) {
    super(
      http,
      `${environment.apiProvider}${environment.maintenanceTicketsEndpoint}`,
      new MaintenanceTicketAssembler()
    );
  }
}
