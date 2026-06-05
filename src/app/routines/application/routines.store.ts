import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RoutinesApi } from '../infrastructure/routines-api';
import { RoutineResource } from '../infrastructure/routines-response';

export type FilterGroup = 'all' | 'chest' | 'legs' | 'back' | 'shoulders' | 'arms';

@Injectable({ providedIn: 'root' })
export class RoutinesStore {

  private readonly api        = inject(RoutinesApi);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _routines = signal<RoutineResource[]>([]);
  private readonly _loading  = signal(false);
  private readonly _error    = signal<string | null>(null);

  readonly searchQuery  = signal('');
  readonly activeFilter = signal<FilterGroup>('all');
  readonly loading      = this._loading.asReadonly();
  readonly error        = this._error.asReadonly();
  readonly routines     = this._routines.asReadonly();

  readonly filteredRoutines = computed(() => {
    const query  = this.searchQuery().toLowerCase();
    const filter = this.activeFilter();
    return this._routines().filter(r => {
      const matchesFilter = filter === 'all' || r.filter_group === filter;
      const matchesSearch = !query || r.name.toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
  });

  constructor() { this.load(); }

  private load(): void {
    this._loading.set(true);
    this._error.set(null);

    this.api.getRoutines()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: routines => {
          this._routines.set(routines);
          this._loading.set(false);
        },
        error: (err: unknown) => {
          this._error.set(err instanceof Error ? err.message : 'Error al cargar rutinas');
          this._loading.set(false);
        },
      });
  }
}
