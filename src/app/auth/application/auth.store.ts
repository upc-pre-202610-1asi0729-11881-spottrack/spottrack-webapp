import { computed, Injectable, signal } from '@angular/core';
import { User, UserRole } from '../domain/model/user.model';

const STORAGE_KEY = 'spottrack_user';

const MOCK_USERS: User[] = [
  { email: 'admin@spottrack.com', name: 'Admin',   role: UserRole.ADMIN  },
  { email: 'cliente@email.com',   name: 'Cliente', role: UserRole.CLIENT },
];

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly userSignal  = signal<User | null>(null);
  private readonly errorSignal = signal<string | null>(null);

  readonly currentUser      = this.userSignal.asReadonly();
  readonly loginError       = this.errorSignal.asReadonly();
  readonly isAuthenticated  = computed(() => this.userSignal() !== null);
  readonly isAdmin          = computed(() => this.userSignal()?.role === UserRole.ADMIN);
  readonly isClient         = computed(() => this.userSignal()?.role === UserRole.CLIENT);

  login(email: string, password: string): void {
    if (!email.trim() || !password.trim()) {
      this.errorSignal.set('auth.error.emptyFields');
      return;
    }
    const user = MOCK_USERS.find(u => u.email === email.trim().toLowerCase());
    if (!user) {
      this.errorSignal.set('auth.error.invalidCredentials');
      return;
    }
    this.userSignal.set(user);
    this.errorSignal.set(null);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }

  logout(): void {
    this.userSignal.set(null);
    this.errorSignal.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  clearError(): void {
    this.errorSignal.set(null);
  }

  private loadFromStorage(): User | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }
}
