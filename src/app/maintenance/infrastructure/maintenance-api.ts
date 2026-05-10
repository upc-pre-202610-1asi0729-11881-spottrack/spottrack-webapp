import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { MaintenanceTicket } from '../domain/model/maintenance-ticket.entity';
import { MaintenanceSchedule } from '../domain/model/maintenance-schedule.entity';
import { MaintenanceTicketApiEndpoint } from './maintenance-ticket-api-endpoint';
import { MaintenanceScheduleApiEndpoint } from './maintenance-schedule-api-endpoint';

@Injectable({ providedIn: 'root' })
export class MaintenanceApi extends BaseApi {
  private readonly ticketEndpoint:   MaintenanceTicketApiEndpoint;
  private readonly scheduleEndpoint: MaintenanceScheduleApiEndpoint;

  constructor(http: HttpClient) {
    super();
    this.ticketEndpoint   = new MaintenanceTicketApiEndpoint(http);
    this.scheduleEndpoint = new MaintenanceScheduleApiEndpoint(http);
  }

  getTickets(): Observable<MaintenanceTicket[]>                                    { return this.ticketEndpoint.getAll(); }
  getTicketById(id: number): Observable<MaintenanceTicket>                         { return this.ticketEndpoint.getById(id); }
  createTicket(ticket: MaintenanceTicket): Observable<MaintenanceTicket>           { return this.ticketEndpoint.create(ticket); }
  updateTicket(ticket: MaintenanceTicket): Observable<MaintenanceTicket>           { return this.ticketEndpoint.update(ticket, ticket.id); }
  deleteTicket(id: number): Observable<void>                                       { return this.ticketEndpoint.delete(id); }

  getSchedules(): Observable<MaintenanceSchedule[]>                                { return this.scheduleEndpoint.getAll(); }
  getScheduleById(id: number): Observable<MaintenanceSchedule>                     { return this.scheduleEndpoint.getById(id); }
  createSchedule(schedule: MaintenanceSchedule): Observable<MaintenanceSchedule>   { return this.scheduleEndpoint.create(schedule); }
  updateSchedule(schedule: MaintenanceSchedule): Observable<MaintenanceSchedule>   { return this.scheduleEndpoint.update(schedule, schedule.id); }
  deleteSchedule(id: number): Observable<void>                                     { return this.scheduleEndpoint.delete(id); }
}
