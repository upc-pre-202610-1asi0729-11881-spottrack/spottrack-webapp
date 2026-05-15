import { BaseEntity } from '../../../shared/infrastructure/base-entity';

/**
 * Aggregated analytics derived from equipment_usage_stats + equipments.
 * Computed on the frontend from API data.
 */
export class AnalyticsStat implements BaseEntity {
  private _id:                 number;
  private _equipmentId:        number;
  private _equipmentName:      string;
  private _zoneId:             number;
  private _totalUsageHours:    number;
  private _usageCountDaily:    number;
  private _estimatedWearLevel: number;
  private _status:             string;

  constructor(props: {
    id:                 number;
    equipmentId:        number;
    equipmentName:      string;
    zoneId:             number;
    totalUsageHours:    number;
    usageCountDaily:    number;
    estimatedWearLevel: number;
    status:             string;
  }) {
    this._id                 = props.id;
    this._equipmentId        = props.equipmentId;
    this._equipmentName      = props.equipmentName;
    this._zoneId             = props.zoneId;
    this._totalUsageHours    = props.totalUsageHours;
    this._usageCountDaily    = props.usageCountDaily;
    this._estimatedWearLevel = props.estimatedWearLevel;
    this._status             = props.status;
  }

  get id():                 number { return this._id; }
  set id(v: number)                { this._id = v; }
  get equipmentId():        number { return this._equipmentId; }
  get equipmentName():      string { return this._equipmentName; }
  get zoneId():             number { return this._zoneId; }
  get totalUsageHours():    number { return this._totalUsageHours; }
  get usageCountDaily():    number { return this._usageCountDaily; }
  get estimatedWearLevel(): number { return this._estimatedWearLevel; }
  get status():             string { return this._status; }
}
