import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MembershipPlanResource, BranchAccessResource } from './membership-response';

@Injectable({ providedIn: 'root' })
export class MembershipApi {
  private readonly plansUrl  = `${environment.apiProvider}membership_plans`;
  private readonly accessUrl = `${environment.apiProvider}branch_access`;

  constructor(private readonly http: HttpClient) {}

  getPlans(): Observable<MembershipPlanResource[]> {
    return this.http.get<MembershipPlanResource[]>(this.plansUrl);
  }

  getPlanById(id: number): Observable<MembershipPlanResource> {
    return this.http.get<MembershipPlanResource>(`${this.plansUrl}/${id}`);
  }

  getBranchAccess(): Observable<BranchAccessResource[]> {
    return this.http.get<BranchAccessResource[]>(this.accessUrl);
  }
}
