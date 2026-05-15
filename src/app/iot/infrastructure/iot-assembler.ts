import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Iot, IotStatus } from '../domain/model/iot.entity';
import { IotResource, IotResponse } from './iot-response';

export class IotAssembler implements BaseAssembler<Iot, IotResource, IotResponse> {
  toEntitiesFromResponse(response: IotResponse): Iot[] {
    return response.map(r => this.toEntityFromResource(r));
  }

  toEntityFromResource(resource: IotResource): Iot {
    return new Iot({
      id:              resource.id,
      equipmentId:     resource.equipment_id,
      macAddress:      resource.mac_address,
      status:          this.mapStatus(resource.status),
      lastHeartbeat:   resource.last_heartbeat,
      location:        resource.location        ?? '',
      batteryLevel:    resource.battery_level   ?? 0,
      signalStrength:  resource.signal_strength ?? 0,
      firmwareVersion: resource.firmware_version ?? '',
    });
  }

  toResourceFromEntity(entity: Iot): IotResource {
    return {
      id:               entity.id,
      equipment_id:     entity.equipmentId,
      mac_address:      entity.macAddress,
      status:           entity.status,
      last_heartbeat:   entity.lastHeartbeat,
      location:         entity.location,
      battery_level:    entity.batteryLevel,
      signal_strength:  entity.signalStrength,
      firmware_version: entity.firmwareVersion,
    };
  }

  // Maps legacy ACTIVE/INACTIVE values from older API responses
  private mapStatus(raw: string): IotStatus {
    if (raw === 'ACTIVE')   return IotStatus.ONLINE;
    if (raw === 'INACTIVE') return IotStatus.OFFLINE;
    return (raw as IotStatus) ?? IotStatus.OFFLINE;
  }
}
