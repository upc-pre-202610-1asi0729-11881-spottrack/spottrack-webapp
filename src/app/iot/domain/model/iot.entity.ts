import { BaseEntity } from '../../../shared/infrastructure/base-entity';

export enum IotStatus {
  ONLINE  = 'ONLINE',
  OFFLINE = 'OFFLINE',
  WARNING = 'WARNING',
}

export enum AlertType {
  DISCONNECTED = 'DISCONNECTED',
  LOW_BATTERY  = 'LOW_BATTERY',
  WEAK_SIGNAL  = 'WEAK_SIGNAL',
}

export class Iot implements BaseEntity {
  private _id:              number;
  private _equipmentId:     number;
  private _macAddress:      string;
  private _status:          IotStatus;
  private _lastHeartbeat:   string;
  private _location:        string;
  private _batteryLevel:    number;
  private _signalStrength:  number;
  private _firmwareVersion: string;

  constructor(props: {
    id:              number;
    equipmentId:     number;
    macAddress:      string;
    status:          IotStatus;
    lastHeartbeat:   string;
    location:        string;
    batteryLevel:    number;
    signalStrength:  number;
    firmwareVersion: string;
  }) {
    this._id              = props.id;
    this._equipmentId     = props.equipmentId;
    this._macAddress      = props.macAddress;
    this._status          = props.status;
    this._lastHeartbeat   = props.lastHeartbeat;
    this._location        = props.location;
    this._batteryLevel    = props.batteryLevel;
    this._signalStrength  = props.signalStrength;
    this._firmwareVersion = props.firmwareVersion;
  }

  get id():              number    { return this._id; }
  set id(v: number)                { this._id = v; }

  get equipmentId():     number    { return this._equipmentId; }
  set equipmentId(v: number)       { this._equipmentId = v; }

  get macAddress():      string    { return this._macAddress; }
  set macAddress(v: string)        { this._macAddress = v; }

  get status():          IotStatus { return this._status; }
  set status(v: IotStatus)         { this._status = v; }

  get lastHeartbeat():   string    { return this._lastHeartbeat; }
  set lastHeartbeat(v: string)     { this._lastHeartbeat = v; }

  get location():        string    { return this._location; }
  set location(v: string)          { this._location = v; }

  get batteryLevel():    number    { return this._batteryLevel; }
  set batteryLevel(v: number)      { this._batteryLevel = v; }

  get signalStrength():  number    { return this._signalStrength; }
  set signalStrength(v: number)    { this._signalStrength = v; }

  get firmwareVersion(): string    { return this._firmwareVersion; }
  set firmwareVersion(v: string)   { this._firmwareVersion = v; }
}
