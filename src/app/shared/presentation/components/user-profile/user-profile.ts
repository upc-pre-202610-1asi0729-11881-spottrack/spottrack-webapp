import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../../../auth/application/auth.store';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css',
})
export class UserProfile {
  private authStore = inject(AuthStore);

  readonly currentUser = this.authStore.currentUser;

  get initials(): string {
    const name = this.currentUser()?.name ?? '';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';
  }
}
