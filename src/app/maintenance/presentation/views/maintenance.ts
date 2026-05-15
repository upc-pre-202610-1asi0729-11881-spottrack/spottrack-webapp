import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MaintenanceStore } from '../../application/maintenance.store';
import { EquipmentStore } from '../../../equipment/application/equipment.store';
import { MaintenanceTicket, TicketPriority, TicketStatus } from '../../domain/model/maintenance-ticket.entity';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslateModule, MatIconModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './maintenance.html',
  styleUrl:    './maintenance.scss',
})
export class MaintenanceComponent {
  readonly store          = inject(MaintenanceStore);
  readonly equipmentStore = inject(EquipmentStore);

  // ── Filters ─────────────────────────────────────────────────────────────
  readonly searchQuery    = signal('');
  readonly statusFilter   = signal<TicketStatus | ''>('');
  readonly priorityFilter = signal<TicketPriority | ''>('');

  private filteredTickets = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const s = this.statusFilter();
    const p = this.priorityFilter();
    return this.store.tickets().filter(t => {
      const name = this.equipmentName(t.equipmentId).toLowerCase();
      const matchQ = !q || name.includes(q) || t.description.toLowerCase().includes(q) || this.ticketId(t).toLowerCase().includes(q);
      const matchS = !s || t.status === s;
      const matchP = !p || t.priority === p;
      return matchQ && matchS && matchP;
    });
  });

  readonly pendingFiltered    = computed(() => this.filteredTickets().filter(t => t.status === TicketStatus.OPEN));
  readonly inProgressFiltered = computed(() => this.filteredTickets().filter(t => t.status === TicketStatus.IN_PROGRESS));
  readonly resolvedFiltered   = computed(() => this.filteredTickets().filter(t => t.status === TicketStatus.RESOLVED));

  ticketId(t: MaintenanceTicket): string {
    return `T-${t.id.toString().padStart(3, '0')}`;
  }

  ticketAge(t: MaintenanceTicket): string {
    const diff = Date.now() - new Date(t.createdAt).getTime();
    const h    = Math.floor(diff / 3600000);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  }

  equipmentName(id: number): string {
    return this.equipmentStore.equipment().find(e => e.id === id)?.name ?? `Equipo #${id}`;
  }

  startTicket(id: number): void    { this.store.startTicket(id); }
  completeTicket(id: number): void { this.store.completeTicket(id); }
}
