import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

interface Alert {
  id: string;
  title: string;
  description: string;
  type: 'admin' | 'client' | 'system';
  icon: string;
  date: Date;
  targetRoute: string;
}

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule, MatIconModule, TranslateModule],
  templateUrl: './alerts.html',
  styleUrl: './alerts.scss',
})
export class AlertsComponent {
  private router = inject(Router);

  alertsList: Alert[] = [
    {
      id: 'ALR-001',
      title: 'Alerta de reabastecimiento: Nivel crítico',
      description:
        'El inventario de "Correa de transmisión XT-500" ha llegado al nivel mínimo de seguridad tras la última reparación.',
      type: 'admin',
      icon: 'warning',
      date: new Date(Date.now() - 5 * 60000), // Hace 5 minutos
      targetRoute: '/maintenance',
    },
    {
      id: 'ALR-002',
      title: 'Desconexión de sensor IoT',
      description: 'La Cinta de Correr #4 (Sede Central) ha perdido conexión con la red principal.',
      type: 'system',
      icon: 'wifi_off',
      date: new Date(Date.now() - 120 * 60000), // Hace 2 horas
      targetRoute: '/iot',
    },
    {
      id: 'ALR-003',
      title: 'Actualización de rutina de cliente',
      description:
        'El cliente Juan Pérez ha solicitado una revisión de su plan de entrenamiento actual.',
      type: 'client',
      icon: 'person',
      date: new Date(Date.now() - 1440 * 60000), // Hace 1 día
      targetRoute: '/dashboard',
    },
  ];

  navigateTo(route: string): void {
    if (route) {
      this.router.navigate([route]);
    }
  }

  deleteAlert(event: Event, id: string): void {
    event.stopPropagation(); // Evita que al dar clic a la X se navegue a otra ruta
    this.alertsList = this.alertsList.filter((alert) => alert.id !== id);
  }

  getRelativeTime(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Hace un momento';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
  }
}
