import { Component, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { AuthStore } from '../../../application/auth.store';
import { LanguageSwitcher } from '../../../../shared/presentation/components/language-switcher/language-switcher';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, TranslateModule, MatIconModule, LanguageSwitcher],
  templateUrl: './login.html',
  styleUrl:    './login.scss',
})
export class LoginComponent {
  private auth   = inject(AuthStore);
  private router = inject(Router);

  readonly loginError = this.auth.loginError;

  email    = '';
  password = '';
  showPass = false;

  constructor() {
    effect(() => {
      if (this.auth.isAuthenticated()) {
        const dest = this.auth.isAdmin() ? '/dashboard' : '/client';
        this.router.navigate([dest]);
      }
    });
  }

  onSubmit(): void {
    this.auth.login(this.email, this.password);
  }

  onInputChange(): void {
    this.auth.clearError();
  }

  fillAdmin(): void {
    this.email    = 'admin@spottrack.com';
    this.password = 'demo1234';
    this.auth.clearError();
  }

  fillClient(): void {
    this.email    = 'cliente@email.com';
    this.password = 'demo1234';
    this.auth.clearError();
  }
}
