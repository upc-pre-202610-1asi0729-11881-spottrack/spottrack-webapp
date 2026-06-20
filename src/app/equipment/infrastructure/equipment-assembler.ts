import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Equipment, EquipmentStatus } from '../domain/model/equipment.entity';
import { EquipmentResource, EquipmentResponse } from './equipment-response';

export class EquipmentAssembler implements BaseAssembler<Equipment, EquipmentResource, EquipmentResponse> {
  toEntitiesFromResponse(response: EquipmentResponse): Equipment[] {
    return response.map(resource => this.toEntityFromResource(resource));
  }

  toEntityFromResource(resource: EquipmentResource): Equipment {
    return new Equipment({
      id:            resource.id,
      zoneId:        Number(resource.zoneId),
      name:          resource.equipmentName,
      brand:         resource.manufacturerId,
      model:         resource.model,
      purchasePrice: resource.purchasePrice,
      status:        resource.status as EquipmentStatus,
    });
  }

  toResourceFromEntity(entity: Equipment): EquipmentResource {
    return {
      id:                   entity.id,
      equipmentName:        entity.name,
      model:                entity.model,
      status:               entity.status,
      zoneId:               String(entity.zoneId),
      manufacturerId:       entity.brand,
      purchasePrice:        entity.purchasePrice,
      maintenanceThreshold: '',
    };
  }
}
