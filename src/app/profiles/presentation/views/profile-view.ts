import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSwitcher } from '../../../shared/presentation/components/language-switcher/language-switcher';
import { AuthStore } from '../../../auth/application/auth.store';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  templateUrl: './profile-view.html',
  styleUrl: './profile-view.scss',
  imports: [LanguageSwitcher, MatIconModule, TranslateModule],
})
export class ProfileView {
  private authStore = inject(AuthStore);
  private router    = inject(Router);

  logout() {
    this.authStore.logout();
    this.router.navigate(['/login']);
  }

  readonly currentUser = this.authStore.currentUser;
  readonly isAdmin     = this.authStore.isAdmin;

  readonly gymData = {
    name: 'SpotTrack Gym',
    locations: 3,
    equipmentTotal: 47,
    iotSensorsOnline: 43,
    memberCount: 312,
    plan: 'Enterprise',
    planPrice: '$299/mes',
    planFeatures: [
      'Hasta 5 sedes activas',
      'Equipos ilimitados monitoreados',
      'Sensores IoT en tiempo real',
      'Analíticas avanzadas e impacto financiero',
      'Soporte prioritario 24/7',
    ],
    renewalDate: '24 de Mayo, 2026',
    memberSince: 'Enero 2024',
  };
}
