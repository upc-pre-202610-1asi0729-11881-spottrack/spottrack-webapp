import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PlanConfig { tier: string; amount: number; currency: string; }

export const MEMBERSHIP_PLANS: Record<string, PlanConfig> = {
  basic:    { tier: 'BASIC',    amount: 69,  currency: 'USD' },
  mid:      { tier: 'MID',      amount: 109, currency: 'USD' },
  platinum: { tier: 'PLATINUM', amount: 189, currency: 'USD' },
};

@Injectable({ providedIn: 'root' })
export class StripePaymentService {
  private readonly base = `${environment.apiBase}/payments`;

  constructor(private readonly http: HttpClient) {}

  async redirectToCheckout(userId: number, planKey: string): Promise<void> {
    const config = MEMBERSHIP_PLANS[planKey];
    if (!config) throw new Error(`Unknown plan: ${planKey}`);

    const { checkoutUrl } = await firstValueFrom(
      this.http.post<{ checkoutUrl: string }>(this.base, {
        userId,
        membershipTier: config.tier,
        amount: config.amount,
        currency: config.currency,
      })
    );

    window.location.href = checkoutUrl;
  }
}
