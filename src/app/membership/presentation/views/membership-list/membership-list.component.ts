import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { MembershipStore } from '../../../application/membership.store';

@Component({
  selector: 'app-membership-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, TranslateModule, RouterLink],
  templateUrl: './membership-list.component.html',
  styleUrl:    './membership-list.component.css',
})
export class MembershipListComponent {
  readonly store = inject(MembershipStore);

  readonly loading     = this.store.loading;
  readonly error       = this.store.error;
  readonly activePlans = this.store.activePlans;

  selectPlan(id: number): void { this.store.selectPlan(id); }
}
