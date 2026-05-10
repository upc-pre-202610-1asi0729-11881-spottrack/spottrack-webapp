import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSwitcher } from '../language-switcher/language-switcher';
import { Sidebar } from '../sidebar/sidebar';
import { BottomBar } from '../bottom-bar/bottom-bar';
import { AuthStore } from '../../../../auth/application/auth.store';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    LanguageSwitcher,
    Sidebar,
    BottomBar,
    MatButtonModule,
    MatIconModule,
    TranslateModule,
    TitleCasePipe,
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  private router = inject(Router);
  private authStore = inject(AuthStore);

  get currentRole(): 'admin' | 'client' {
    return this.authStore.isClient() ? 'client' : 'admin';
  }

  // --- NUEVA FUNCIÓN PARA PRUEBAS RÁPIDAS ---
  toggleMockRole() {
    if (this.currentRole === 'admin') {
      // Inicia sesión como cliente con cualquier contraseña (el mock solo valida que no esté vacía)
      this.authStore.login('cliente@email.com', '1234');
    } else {
      // Inicia sesión como admin
      this.authStore.login('admin@spottrack.com', '1234');
    }
  }

  logout() {
    this.authStore.logout();
    this.router.navigate(['/auth/login']);
  }
}
