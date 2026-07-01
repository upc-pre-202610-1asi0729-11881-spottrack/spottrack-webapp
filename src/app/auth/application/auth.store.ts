import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { AuthApiService } from '../infrastructure/auth-api.service';
import { ProfileApiService } from '../infrastructure/profile-api.service';
import { User, UserRole } from '../domain/model/user.model';

const TOKEN_KEY = 'spottrack_token';
const USER_KEY  = 'spottrack_user';

// The public sign-up endpoint always grants ROLE_CLIENT — there is no
// self-service path to ROLE_ADMIN today (sign-up-staff requires an existing
// admin token). "businessIntent" only steers local navigation (into the
// plan/payment flow); the persisted backend role is always CLIENT.
export interface RegisterData {
  firstName:      string;
  lastName:       string;
  dni:            string;
  phoneNumber:    string;
  email:          string;
  password:       string;
  businessIntent: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly api        = inject(AuthApiService);
  private readonly profileApi = inject(ProfileApiService);
  private readonly router     = inject(Router);

  private readonly userSignal  = signal<User | null>(this.loadUser());
  private readonly tokenSignal = signal<string | null>(
    localStorage.getItem(TOKEN_KEY)
  );
  private readonly errorSignal         = signal<string | null>(null);
  private readonly registerErrorSignal = signal<string | null>(null);
  private readonly registerLoadingSignal = signal(false);

  readonly currentUser      = this.userSignal.asReadonly();
  readonly token            = this.tokenSignal.asReadonly();
  readonly loginError       = this.errorSignal.asReadonly();
  readonly registerError    = this.registerErrorSignal.asReadonly();
  readonly registerLoading  = this.registerLoadingSignal.asReadonly();
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

  register(data: RegisterData): void {
    this.registerErrorSignal.set(null);
    this.registerLoadingSignal.set(true);

    this.api.signUp({ username: data.email.trim(), password: data.password }).pipe(
      switchMap(() => this.api.signIn({ username: data.email.trim(), password: data.password }))
    ).subscribe({
      next: res => {
        // Token must be set before the next calls so the JWT interceptor attaches it
        this.tokenSignal.set(res.token);
        localStorage.setItem(TOKEN_KEY, res.token);

        // Sign-up already auto-creates a blank Client profile server-side
        // (RoleAssignedEventHandler), so calling POST /profiles/clients here
        // would 409 against that row and skip the update below entirely.
        this.profileApi.updateClientProfile({
          firstName:   data.firstName.trim(),
          lastName:    data.lastName.trim(),
          phoneNumber: data.phoneNumber.trim(),
          dni:         data.dni.trim(),
        }).subscribe({
          next: () => {
            const user: User = {
              id:    res.id,
              email: res.username,
              name:  `${data.firstName.trim()} ${data.lastName.trim()}`,
              role:  UserRole.CLIENT,
            };
            this.userSignal.set(user);
            localStorage.setItem(USER_KEY, JSON.stringify(user));
            this.registerLoadingSignal.set(false);

            this.router.navigate(data.businessIntent ? ['/register/plans'] : ['/map']);
          },
          error: () => {
            this.registerLoadingSignal.set(false);
            this.registerErrorSignal.set('auth.error.profileFailed');
          },
        });
      },
      error: err => {
        this.registerLoadingSignal.set(false);
        this.registerErrorSignal.set(
          err?.status === 409 || err?.status === 400
            ? 'auth.error.emailTaken'
            : 'auth.error.registerFailed'
        );
      },
    });
  }

  clearRegisterError(): void { this.registerErrorSignal.set(null); }

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
