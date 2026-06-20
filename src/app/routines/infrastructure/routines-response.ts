import { BaseResource } from '../../shared/infrastructure/base-response';

export interface RoutineResource extends BaseResource {
  id:           number;
  name:         string;
  objective:    string;
  level:        'beginner' | 'intermediate' | 'advanced';
  filter_group: string;
  block_count:  number;
}

export type RoutineResponse = RoutineResource[];

export interface ExerciseBlockResource extends BaseResource {
  id:           number;
  routine_id:   number;
  exercise_key: string;
  machine_key:  string;
  sets:         number;
  reps:         number;
  order:        number;
}

export type ExerciseBlockResponse = ExerciseBlockResource[];
