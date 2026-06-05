import { BaseResource } from '../../shared/infrastructure/base-response';

export interface AlertResource extends BaseResource {
  id:           number;
  title:        string;
  description:  string;
  type:         'admin' | 'client' | 'system';
  icon:         string;
  date:         string;
  target_route: string;
  read:         boolean;
}

export type AlertResponse = AlertResource[];
