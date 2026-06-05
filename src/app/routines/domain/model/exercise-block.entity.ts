import { BaseEntity } from '../../../shared/infrastructure/base-entity';

export class ExerciseBlock implements BaseEntity {
  private _id:          number;
  private _routineId:   number;
  private _exerciseKey: string;
  private _machineKey:  string;
  private _sets:        number;
  private _reps:        number;
  private _order:       number;

  constructor(props: {
    id:          number;
    routineId:   number;
    exerciseKey: string;
    machineKey:  string;
    sets:        number;
    reps:        number;
    order:       number;
  }) {
    this._id          = props.id;
    this._routineId   = props.routineId;
    this._exerciseKey = props.exerciseKey;
    this._machineKey  = props.machineKey;
    this._sets        = props.sets;
    this._reps        = props.reps;
    this._order       = props.order;
  }

  get id():          number { return this._id; }
  set id(v: number)         { this._id = v; }
  get routineId():   number { return this._routineId; }
  get exerciseKey(): string { return this._exerciseKey; }
  get machineKey():  string { return this._machineKey; }
  get sets():        number { return this._sets; }
  get reps():        number { return this._reps; }
  get order():       number { return this._order; }
}
