import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { MembershipApi } from '../infrastructure/membership-api';
import { MembershipPlanResource, BranchAccessResource } from '../infrastructure/membership-response';

@Injectable({ providedIn: 'root' })
export class MembershipStore {

  private readonly api        = inject(MembershipApi);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _plans        = signal<MembershipPlanResource[]>([]);
  private readonly _branchAccess = signal<BranchAccessResource[]>([]);
  private readonly _loading      = signal(false);
  private readonly _error        = signal<string | null>(null);
  readonly selectedPlanId        = signal<number | null>(null);

  readonly loading = this._loading.asReadonly();
  readonly error   = this._error.asReadonly();
  readonly plans   = this._plans.asReadonly();

  readonly selectedPlan = computed(() => {
    const id = this.selectedPlanId();
    return id !== null ? (this._plans().find(p => p.id === id) ?? null) : null;
  });

  readonly activePlans = computed(() =>
    this._plans().filter(p => p.is_active)
  );

  readonly branchAccessForPlan = computed(() => {
    const id = this.selectedPlanId();
    return id !== null
      ? this._branchAccess().filter(a => a.plan_id === id)
      : [];
  });

  constructor() { this.load(); }

  selectPlan(id: number): void { this.selectedPlanId.set(id); }
  clearSelection(): void        { this.selectedPlanId.set(null); }

  private load(): void {
    this._loading.set(true);
    this._error.set(null);

    forkJoin({
      plans:  this.api.getPlans(),
      access: this.api.getBranchAccess(),
    })
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: ({ plans, access }) => {
        this._plans.set(plans);
        this._branchAccess.set(access);
        this._loading.set(false);
      },
      error: (err: unknown) => {
        this._error.set(err instanceof Error ? err.message : 'Error al cargar membresías');
        this._loading.set(false);
      },
    });
  }
}
