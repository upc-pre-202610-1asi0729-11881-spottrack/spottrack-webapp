import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { AuthStore } from '../../../application/auth.store';
import { StripePaymentService, MEMBERSHIP_PLANS } from '../../../infrastructure/stripe-payment.service';

interface PlanCard {
  key:      string;
  price:    number;
  popular:  boolean;
  features: string[];
}

@Component({
  selector: 'app-plan-selection',
  standalone: true,
  imports: [TranslateModule, MatIconModule],
  templateUrl: './plan-selection.html',
  styleUrl:    './plan-selection.scss',
})
export class PlanSelectionComponent implements OnInit {
  private auth   = inject(AuthStore);
  private stripe = inject(StripePaymentService);
  private router = inject(Router);

  selectedKey  = 'basic';
  loadingPlan  = false;
  errorMsg     = '';

  readonly plans: PlanCard[] = [
    {
      key: 'basic', price: MEMBERSHIP_PLANS['basic'].amount, popular: false,
      features: ['plan20Equipment', 'planRealtimeMonitoring', 'planMaintenanceAlerts', 'planEmailSupport'],
    },
    {
      key: 'mid', price: MEMBERSHIP_PLANS['mid'].amount, popular: true,
      features: ['plan60Equipment', 'planRealtimeMonitoring', 'planAdvancedAlerts', 'planPrioritySupport', 'planAnalytics'],
    },
    {
      key: 'platinum', price: MEMBERSHIP_PLANS['platinum'].amount, popular: false,
      features: ['planUnlimitedEquipment', 'planRealtimeMonitoring', 'planCustomReports', 'plan24Support', 'planFullAnalytics'],
    },
  ];

  ngOnInit(): void {
    // This page requires the registration flow's session; bounce back if it's missing.
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/register']);
    }
  }

  get selectedPlan(): PlanCard {
    return this.plans.find(p => p.key === this.selectedKey) ?? this.plans[0];
  }

  selectPlan(key: string): void {
    this.selectedKey = key;
  }

  async proceedToPayment(): Promise<void> {
    if (this.loadingPlan) return;
    const user = this.auth.currentUser();
    if (!user) { this.router.navigate(['/register']); return; }

    this.loadingPlan = true;
    this.errorMsg = '';
    try {
      await this.stripe.redirectToCheckout(user.id, this.selectedKey);
    } catch {
      this.errorMsg = 'auth.plans.checkoutError';
      this.loadingPlan = false;
    }
  }
}
