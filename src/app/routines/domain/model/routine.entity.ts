import { BaseEntity } from '../../../shared/infrastructure/base-entity';

export class Routine implements BaseEntity {
  private _id:          number;
  private _name:        string;
  private _objective:   string;
  private _level:       'beginner' | 'intermediate' | 'advanced';
  private _filterGroup: string;
  private _blockCount:  number;

  constructor(props: {
    id:          number;
    name:        string;
    objective:   string;
    level:       'beginner' | 'intermediate' | 'advanced';
    filterGroup: string;
    blockCount:  number;
  }) {
    this._id          = props.id;
    this._name        = props.name;
    this._objective   = props.objective;
    this._level       = props.level;
    this._filterGroup = props.filterGroup;
    this._blockCount  = props.blockCount;
  }

  get id():          number                                   { return this._id; }
  set id(v: number)                                           { this._id = v; }
  get name():        string                                   { return this._name; }
  get objective():   string                                   { return this._objective; }
  get level():       'beginner' | 'intermediate' | 'advanced' { return this._level; }
  get filterGroup(): string                                   { return this._filterGroup; }
  get blockCount():  number                                   { return this._blockCount; }
}
