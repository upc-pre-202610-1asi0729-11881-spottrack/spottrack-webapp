import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { MaintenanceTicket } from '../domain/model/maintenance-ticket.entity';
import { MaintenanceTicketResource } from './maintenance-response';
import { MaintenanceTicketAssembler } from './maintenance-ticket-assembler';
import { environment } from '../../../environments/environment';

export class MaintenanceTicketApiEndpoint {
  private readonly url = `${environment.apiBase}/maintenance/tickets`;
  private readonly assembler = new MaintenanceTicketAssembler();

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<MaintenanceTicket[]> {
    return this.http.get<MaintenanceTicketResource[]>(this.url).pipe(
      map(list => list.map(r => this.assembler.toEntityFromResource(r))),
      catchError(err => throwError(() => err))
    );
  }

  getById(id: number): Observable<MaintenanceTicket> {
    return this.http.get<MaintenanceTicketResource>(`${this.url}/${id}`).pipe(
      map(r => this.assembler.toEntityFromResource(r)),
      catchError(err => throwError(() => err))
    );
  }

  create(entity: MaintenanceTicket): Observable<MaintenanceTicket> {
    const resource = this.assembler.toResourceFromEntity(entity);
    return this.http.post<MaintenanceTicketResource>(this.url, resource).pipe(
      map(r => this.assembler.toEntityFromResource(r)),
      catchError(err => throwError(() => err))
    );
  }

  update(entity: MaintenanceTicket, id: number): Observable<MaintenanceTicket> {
    const resource = this.assembler.toResourceFromEntity(entity);
    return this.http.put<MaintenanceTicketResource>(`${this.url}/${id}`, resource).pipe(
      map(r => this.assembler.toEntityFromResource(r)),
      catchError(err => throwError(() => err))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`).pipe(
      catchError(err => throwError(() => err))
    );
  }
}
