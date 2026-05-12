import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSwitcher } from '../language-switcher/language-switcher';
import { Sidebar } from '../sidebar/sidebar';
import { BottomBar } from '../bottom-bar/bottom-bar';
import { AuthStore } from '../../../../auth/application/auth.store';
import { UserProfile } from '../user-profile/user-profile';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    LanguageSwitcher,
    Sidebar,
    BottomBar,
    MatIconModule,
    TranslateModule,
    UserProfile
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

  logout() {
    this.authStore.logout();
    this.router.navigate(['/auth/login']);
  }
}
