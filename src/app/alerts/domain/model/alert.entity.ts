import { BaseEntity } from '../../../shared/infrastructure/base-entity';

export class Alert implements BaseEntity {
  private _id:          number;
  private _title:       string;
  private _description: string;
  private _type:        'admin' | 'client' | 'system';
  private _icon:        string;
  private _date:        Date;
  private _targetRoute: string;
  private _read:        boolean;

  constructor(props: {
    id:          number;
    title:       string;
    description: string;
    type:        'admin' | 'client' | 'system';
    icon:        string;
    date:        Date;
    targetRoute: string;
    read:        boolean;
  }) {
    this._id          = props.id;
    this._title       = props.title;
    this._description = props.description;
    this._type        = props.type;
    this._icon        = props.icon;
    this._date        = props.date;
    this._targetRoute = props.targetRoute;
    this._read        = props.read;
  }

  get id():          number                        { return this._id; }
  set id(v: number)                                { this._id = v; }
  get title():       string                        { return this._title; }
  get description(): string                        { return this._description; }
  get type():        'admin' | 'client' | 'system' { return this._type; }
  get icon():        string                        { return this._icon; }
  get date():        Date                          { return this._date; }
  get targetRoute(): string                        { return this._targetRoute; }
  get read():        boolean                       { return this._read; }
}
