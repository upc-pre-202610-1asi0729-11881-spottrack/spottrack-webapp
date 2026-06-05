import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RoutineResource, ExerciseBlockResource } from './routines-response';

@Injectable({ providedIn: 'root' })
export class RoutinesApi {
  private readonly routinesUrl = `${environment.apiProvider}routines`;
  private readonly blocksUrl   = `${environment.apiProvider}exercise_blocks`;

  constructor(private readonly http: HttpClient) {}

  getRoutines(): Observable<RoutineResource[]> {
    return this.http.get<RoutineResource[]>(this.routinesUrl);
  }

  getBlocksByRoutine(routineId: number): Observable<ExerciseBlockResource[]> {
    return this.http.get<ExerciseBlockResource[]>(`${this.blocksUrl}?routine_id=${routineId}`);
  }
}
