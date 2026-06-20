import { BaseEntity } from '../../../shared/infrastructure/base-entity';

export class FinancialStat implements BaseEntity {
  private _id:                number;
  private _equipmentId:       number;
  private _equipmentName:     string;
  private _status:            string;
  private _purchasePrice:     number;
  private _usageCountDaily:   number;
  private _totalUsageHours:   number;

  constructor(props: {
    id:              number;
    equipmentId:     number;
    equipmentName:   string;
    status:          string;
    purchasePrice:   number;
    usageCountDaily: number;
    totalUsageHours: number;
  }) {
    this._id              = props.id;
    this._equipmentId     = props.equipmentId;
    this._equipmentName   = props.equipmentName;
    this._status          = props.status;
    this._purchasePrice   = props.purchasePrice;
    this._usageCountDaily = props.usageCountDaily;
    this._totalUsageHours = props.totalUsageHours;
  }

  get id():              number { return this._id; }
  set id(v: number)             { this._id = v; }
  get equipmentId():     number { return this._equipmentId; }
  get equipmentName():   string { return this._equipmentName; }
  get status():          string { return this._status; }
  get purchasePrice():   number { return this._purchasePrice; }
  get usageCountDaily(): number { return this._usageCountDaily; }
  get totalUsageHours(): number { return this._totalUsageHours; }
}
