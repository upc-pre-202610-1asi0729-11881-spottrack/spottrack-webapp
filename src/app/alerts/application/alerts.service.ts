import { Injectable, signal, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export interface AppAlert {
  id: string;
  title?: string;           // plain text (for dynamically generated alerts)
  titleKey?: string;        // i18n key (for seeded/static alerts)
  description?: string;
  descriptionKey?: string;
  type: 'admin' | 'client' | 'system';
  icon: string;
  date: Date;
  targetRoute: string;
  read: boolean;
}

@Injectable({ providedIn: 'root' })
export class AlertsService {
  private translate = inject(TranslateService);

  alerts = signal<AppAlert[]>([
    {
      id: 'ALR-001',
      titleKey:       'alerts.seeded.alr001.title',
      descriptionKey: 'alerts.seeded.alr001.description',
      type:        'admin',
      icon:        'warning',
      date:        new Date(Date.now() - 5 * 60000),
      targetRoute: '/maintenance',
      read:        true,
    },
    {
      id: 'ALR-002',
      titleKey:       'alerts.seeded.alr002.title',
      descriptionKey: 'alerts.seeded.alr002.description',
      type:        'system',
      icon:        'wifi_off',
      date:        new Date(Date.now() - 120 * 60000),
      targetRoute: '/iot',
      read:        true,
    },
    {
      id: 'ALR-003',
      titleKey:       'alerts.seeded.alr003.title',
      descriptionKey: 'alerts.seeded.alr003.description',
      type:        'client',
      icon:        'person',
      date:        new Date(Date.now() - 1440 * 60000),
      targetRoute: '/dashboard',
      read:        true,
    },
  ]);

  // Called when a reservation timer expires
  addReservationExpiredAlert(nameKey: string): void {
    const machine = this.translate.instant('machines.names.' + nameKey);
    this.alerts.update(list => [
      {
        id:          `RES-EXP-${Date.now()}`,
        title:       this.translate.instant('clientAlerts.reservationExpired.title',       { machine }),
        description: this.translate.instant('clientAlerts.reservationExpired.description', { machine }),
        type:        'client',
        icon:        'event_busy',
        date:        new Date(),
        targetRoute: '/bookings',
        read:        false,
      },
      ...list,
    ]);
  }

  deleteAlert(id: string): void {
    this.alerts.update(list => list.filter(a => a.id !== id));
  }

  // Only marks alerts that belong to the given role as read
  markReadForRole(role: 'admin' | 'client'): void {
    this.alerts.update(list =>
      list.map(a => {
        if (role === 'client' && a.type !== 'client') return a;
        return { ...a, read: true };
      })
    );
  }
}
