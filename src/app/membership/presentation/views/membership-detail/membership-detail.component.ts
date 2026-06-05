import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { MembershipStore } from '../../../application/membership.store';

@Component({
  selector: 'app-membership-detail',
  standalone: true,
  imports: [CommonModule, MatIconModule, TranslateModule, RouterLink],
  templateUrl: './membership-detail.component.html',
  styleUrl:    './membership-detail.component.css',
})
export class MembershipDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly store         = inject(MembershipStore);

  readonly loading      = this.store.loading;
  readonly selectedPlan = this.store.selectedPlan;
  readonly branchAccess = this.store.branchAccessForPlan;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!isNaN(id)) this.store.selectPlan(id);
  }

  accessTypeLabel(type: 'FULL' | 'LIMITED' | 'RESTRICTED'): string {
    return { FULL: 'Acceso completo', LIMITED: 'Acceso limitado', RESTRICTED: 'Acceso restringido' }[type];
  }
}
