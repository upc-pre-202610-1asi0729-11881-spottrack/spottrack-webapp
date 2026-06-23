import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Equipment, EquipmentStatus } from '../domain/model/equipment.entity';
import { EquipmentResource, EquipmentResponse } from './equipment-response';

export class EquipmentAssembler implements BaseAssembler<Equipment, EquipmentResource, EquipmentResponse> {
  toEntitiesFromResponse(response: EquipmentResponse): Equipment[] {
    return response.map(r => this.toEntityFromResource(r));
  }

  toEntityFromResource(r: EquipmentResource): Equipment {
    return new Equipment({
      id:               r.id ?? 0,
      zoneId:           Number(r.zoneId) || 0,
      name:             r.equipmentName ?? '',
      brand:            r.manufacturerId ?? '',
      model:            r.model ?? '',
      purchaseAmount:   r.purchaseAmount ?? 0,
      purchaseCurrency: r.purchaseCurrency ?? 'USD',
      status:           (r.status as EquipmentStatus) ?? EquipmentStatus.AVAILABLE,
    });
  }

  toResourceFromEntity(e: Equipment): EquipmentResource {
    return {
      id:               e.id,
      equipmentName:    e.name,
      model:            e.model,
      status:           e.status,
      zoneId:           String(e.zoneId),
      manufacturerId:   e.brand,
      purchaseCurrency: e.purchaseCurrency,
      purchaseAmount:   e.purchaseAmount,
    };
  }
}
