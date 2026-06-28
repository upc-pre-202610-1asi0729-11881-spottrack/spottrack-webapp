import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthApiService } from '../infrastructure/auth-api.service';
import { User, UserRole } from '../domain/model/user.model';

const TOKEN_KEY = 'spottrack_token';
const USER_KEY  = 'spottrack_user';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly api    = inject(AuthApiService);
  private readonly router = inject(Router);

  private readonly userSignal  = signal<User | null>(this.loadUser());
  private readonly tokenSignal = signal<string | null>(
    localStorage.getItem(TOKEN_KEY)
  );
  private readonly errorSignal = signal<string | null>(null);

  readonly currentUser     = this.userSignal.asReadonly();
  readonly token           = this.tokenSignal.asReadonly();
  readonly loginError      = this.errorSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.tokenSignal() !== null);
  readonly isAdmin         = computed(() =>
    this.userSignal()?.role === UserRole.ADMIN
  );
  readonly isClient = computed(() =>
    this.userSignal()?.role === UserRole.CLIENT
  );

  login(email: string, password: string): void {
    if (!email.trim() || !password.trim()) {
      this.errorSignal.set('auth.error.emptyFields');
      return;
    }
    this.api.signIn({ username: email.trim(), password }).subscribe({
      next: res => {
        // Token must be set before the next call so the JWT interceptor attaches it
        this.tokenSignal.set(res.token);
        localStorage.setItem(TOKEN_KEY, res.token);
        this.errorSignal.set(null);

        this.api.getUser(res.id).subscribe({
          next: details => {
            const raw     = details.roles?.[0] ?? details.role ?? '';
            const roleStr = String(raw).toUpperCase();
            const role    = roleStr.includes('ADMIN') ? UserRole.ADMIN : UserRole.CLIENT;
            const user: User = { id: res.id, email: res.username, name: res.username, role };
            this.userSignal.set(user);
            localStorage.setItem(USER_KEY, JSON.stringify(user));
            this.router.navigate([role === UserRole.ADMIN ? '/dashboard' : '/map']);
          },
          error: () => {
            // getUser failed — clear session and show error
            this.tokenSignal.set(null);
            localStorage.removeItem(TOKEN_KEY);
            this.errorSignal.set('auth.error.invalidCredentials');
          },
        });
      },
      error: () => this.errorSignal.set('auth.error.invalidCredentials'),
    });
  }

  logout(): void {
    this.userSignal.set(null);
    this.tokenSignal.set(null);
    this.errorSignal.set(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.router.navigate(['/login']);
  }

  clearError(): void { this.errorSignal.set(null); }

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch { return null; }
  }
}
