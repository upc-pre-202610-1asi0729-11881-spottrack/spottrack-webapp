import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { MembershipStore } from '../../../application/membership.store';
import { ContextMenuDirective } from '../../../../shared/presentation/directives/context-menu.directive';
import { ContextMenuItem } from '../../../../shared/application/context-menu.service';

@Component({
  selector: 'app-membership-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, TranslateModule, RouterLink, ContextMenuDirective],
  templateUrl: './membership-list.component.html',
  styleUrl:    './membership-list.component.css',
})
export class MembershipListComponent {
  readonly store = inject(MembershipStore);

  readonly loading     = this.store.loading;
  readonly error       = this.store.error;
  readonly activePlans = this.store.activePlans;

  selectPlan(id: number): void { this.store.selectPlan(id); }

  planMenu(id: number, name: string): ContextMenuItem[] {
    return [
      { label: 'View details',  icon: 'open_in_new',  action: () => this.selectPlan(id) },
      { label: 'Copy plan name',icon: 'content_copy', action: () => navigator.clipboard.writeText(name) },
    ];
  }
}
