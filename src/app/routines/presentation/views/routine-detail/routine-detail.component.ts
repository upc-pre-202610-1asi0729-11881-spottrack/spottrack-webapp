import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { RoutinesApi } from '../../../infrastructure/routines-api';
import { ExerciseBlockResource } from '../../../infrastructure/routines-response';
import { RoutinesStore } from '../../../application/routines.store';

@Component({
  selector: 'app-routine-detail',
  standalone: true,
  imports: [CommonModule, MatIconModule, TranslateModule, RouterLink],
  templateUrl: './routine-detail.component.html',
  styleUrl: './routine-detail.component.css',
})
export class RoutineDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api   = inject(RoutinesApi);
  readonly store         = inject(RoutinesStore);

  readonly blocks  = signal<ExerciseBlockResource[]>([]);
  readonly loading = signal(false);

  get routineId(): number { return Number(this.route.snapshot.paramMap.get('id')); }

  get routine() {
    return this.store.routines().find(r => r.id === this.routineId) ?? null;
  }

  ngOnInit(): void {
    if (!this.routineId) return;
    this.loading.set(true);
    this.api.getBlocksByRoutine(this.routineId).subscribe({
      next: blocks => { this.blocks.set(blocks); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
