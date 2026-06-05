import { BaseResource } from '../../shared/infrastructure/base-response';

export interface MembershipPlanResource extends BaseResource {
  id:           number;
  name:         string;
  description:  string;
  price:        number;
  max_branches: number;
  features:     string[];
  is_active:    boolean;
}

export type MembershipPlanResponse = MembershipPlanResource[];

export interface BranchAccessResource extends BaseResource {
  id:          number;
  plan_id:     number;
  branch_id:   number;
  branch_name: string;
  access_type: 'FULL' | 'LIMITED' | 'RESTRICTED';
  start_date:  string;
  end_date:    string | null;
}

export type BranchAccessResponse = BranchAccessResource[];
