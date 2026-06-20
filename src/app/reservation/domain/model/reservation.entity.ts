import { BaseEntity } from '../../../shared/infrastructure/base-entity';

export class Reservation implements BaseEntity {
  private _id:              number;
  private _machineId:       string;
  private _machineName:     string;
  private _startTime:       string;
  private _durationSeconds: number;
  private _status:          'active' | 'expired' | 'cancelled';

  constructor(props: {
    id:              number;
    machineId:       string;
    machineName:     string;
    startTime:       string;
    durationSeconds: number;
    status:          'active' | 'expired' | 'cancelled';
  }) {
    this._id              = props.id;
    this._machineId       = props.machineId;
    this._machineName     = props.machineName;
    this._startTime       = props.startTime;
    this._durationSeconds = props.durationSeconds;
    this._status          = props.status;
  }

  get id():              number                              { return this._id; }
  set id(v: number)                                         { this._id = v; }
  get machineId():       string                             { return this._machineId; }
  get machineName():     string                             { return this._machineName; }
  get startTime():       string                             { return this._startTime; }
  get durationSeconds(): number                             { return this._durationSeconds; }
  get status():          'active' | 'expired' | 'cancelled' { return this._status; }

  get isActive(): boolean { return this._status === 'active'; }
}
