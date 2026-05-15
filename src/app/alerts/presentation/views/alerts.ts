import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AlertsService, AppAlert } from '../../application/alerts.service';
import { AuthStore } from '../../../auth/application/auth.store';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule, MatIconModule, TranslateModule],
  templateUrl: './alerts.html',
  styleUrl: './alerts.scss',
})
export class AlertsComponent implements OnInit {
  private router      = inject(Router);
  private translate   = inject(TranslateService);
  private authStore   = inject(AuthStore);
  alertsService       = inject(AlertsService);

  get currentRole(): 'admin' | 'client' {
    return this.authStore.isClient() ? 'client' : 'admin';
  }

  // Admin sees every alert; clients only see their own
  get alertsList(): AppAlert[] {
    const all = this.alertsService.alerts();
    return this.currentRole === 'client'
      ? all.filter(a => a.type === 'client')
      : all;
  }

  ngOnInit(): void {
    this.alertsService.markReadForRole(this.currentRole);
  }

  navigateTo(route: string): void {
    if (route) this.router.navigate([route]);
  }

  deleteAlert(event: Event, id: string): void {
    event.stopPropagation();
    this.alertsService.deleteAlert(id);
  }

  resolveTitle(alert: AppAlert): string {
    return alert.titleKey ? this.translate.instant(alert.titleKey) : (alert.title ?? '');
  }

  resolveDescription(alert: AppAlert): string {
    return alert.descriptionKey ? this.translate.instant(alert.descriptionKey) : (alert.description ?? '');
  }

  getRelativeTime(date: Date): string {
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return this.translate.instant('alerts.time.moment');
    const m = Math.floor(diff / 60);
    if (m < 60) return this.translate.instant(m === 1 ? 'alerts.time.minute' : 'alerts.time.minutes', { count: m });
    const h = Math.floor(m / 60);
    if (h < 24) return this.translate.instant(h === 1 ? 'alerts.time.hour' : 'alerts.time.hours', { count: h });
    const d = Math.floor(h / 24);
    return this.translate.instant(d === 1 ? 'alerts.time.day' : 'alerts.time.days', { count: d });
  }
}
