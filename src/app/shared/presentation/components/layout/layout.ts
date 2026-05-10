import { Component, inject } from '@angular/core';
import { SessionService } from '../../../application/session.service';
import { RouterOutlet } from '@angular/router';
import { LanguageSwitcher } from '../language-switcher/language-switcher';
import { Sidebar } from '../sidebar/sidebar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-layout',
  standalone: true, // Asumiendo que es standalone por tu estructura
  imports: [
    RouterOutlet,
    LanguageSwitcher,
    Sidebar,
    MatButtonModule,
    MatIconModule,
    TranslateModule,
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  private sessionService = inject(SessionService);

  // Reemplazamos la variable por un Getter
  get currentRole(): 'admin' | 'client' {
    return this.sessionService.currentRole();
  }
  toggleRole() {
    this.sessionService.toggleRole();
  }
}
