import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  currentRole = signal<'admin' | 'client'>('admin');

  toggleRole() {
    this.currentRole.update((role) => (role === 'admin' ? 'client' : 'admin'));
  }
}
