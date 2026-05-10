import { Component, Input, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { AuthStore } from '../../../../auth/application/auth.store';

// Exportamos la interfaz para evitar errores en WebStorm
export interface NavItem {
  path: string;
  icon: string;
  labelKey: string;
}

const ADMIN_NAV: NavItem[] = [
  { path: '/dashboard', icon: 'home', labelKey: 'nav.dashboard' },
  { path: '/equipments', icon: 'fitness_center', labelKey: 'nav.equipment' },
  { path: '/iot', icon: 'sensors', labelKey: 'nav.iot' },
  { path: '/maintenance', icon: 'build', labelKey: 'nav.maintenance' },
  { path: '/analytics', icon: 'bar_chart', labelKey: 'nav.analytics' },
  { path: '/alerts', icon: 'notifications', labelKey: 'nav.alerts' },
  { path: '/configuration', icon: 'settings', labelKey: 'nav.configuration' },
];

const CLIENT_NAV: NavItem[] = [
  { path: '/dashboard', icon: 'home', labelKey: 'nav.dashboard' },
  { path: '/map', icon: 'map', labelKey: 'nav.map' },
  { path: '/routines', icon: 'fitness_center', labelKey: 'nav.routines' },
  { path: '/bookings', icon: 'event_available', labelKey: 'nav.bookings' },
  { path: '/profile', icon: 'person', labelKey: 'nav.profile' },
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule, TranslateModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  // Inyección del store de tu compañero (por si lo necesitan más adelante)
  private authStore = inject(AuthStore);

  // Variable pública para que el HTML la pueda iterar sin problemas
  navItems: NavItem[] = ADMIN_NAV;

  // Setter para actualizar las rutas instantáneamente al cambiar de rol
  @Input()
  set role(value: 'admin' | 'client') {
    this.navItems = value === 'admin' ? ADMIN_NAV : CLIENT_NAV;
  }
}
