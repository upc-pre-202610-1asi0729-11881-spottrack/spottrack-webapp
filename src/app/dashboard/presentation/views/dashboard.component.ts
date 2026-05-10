import { Component, inject, computed } from '@angular/core';
import { AuthStore } from '../../../auth/application/auth.store';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { TranslateModule } from '@ngx-translate/core';
import { MapComponent } from '../../../map/map.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatIconModule, MatCardModule, TranslateModule, MapComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  private authStore = inject(AuthStore);

  get currentRole(): 'admin' | 'client' {
    return this.authStore.isClient() ? 'client' : 'admin';
  }

  userName = computed(() => this.authStore.currentUser()?.name || 'Invitado');
}
