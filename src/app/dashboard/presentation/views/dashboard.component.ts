import { Component, inject } from '@angular/core';
import { SessionService } from '../../../shared/application/session.service';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatIconModule, MatCardModule, TranslateModule],
  templateUrl: './dashboard.component.html',
  styles: [
    `
      .dashboard-content {
        display: flex;
        flex-direction: column;
        height: 100%;
        gap: 16px;
      }
      .stub-page {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin-top: 48px;
        color: #aaa;
      }
      .stub-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: #4fc3f7;
      }
      .welcome-card {
        background-color: #1e1e1e;
        color: white;
      }
      h1 {
        margin: 0;
        font-size: 1.5rem;
      }
      p {
        margin: 0;
      }
    `,
  ],
})
export class DashboardComponent {
  private sessionService = inject(SessionService);
  userName: string = 'Alvaro';

  get currentRole(): 'admin' | 'client' {
    return this.sessionService.currentRole();
  }
}
