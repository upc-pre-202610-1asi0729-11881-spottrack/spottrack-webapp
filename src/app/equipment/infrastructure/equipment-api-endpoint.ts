import { HttpClient } from '@angular/common/http';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { Equipment } from '../domain/model/equipment.entity';
import { EquipmentResource, EquipmentResponse } from './equipment-response';
import { EquipmentAssembler } from './equipment-assembler';
import { environment } from '../../../environments/environment';

export class EquipmentApiEndpoint extends BaseApiEndpoint<Equipment, EquipmentResource, EquipmentResponse, EquipmentAssembler> {
  constructor(http: HttpClient) {
    super(
      http,
      `${environment.apiProvider}${environment.equipmentEndpoints}`,
      new EquipmentAssembler()
    );
  }
}
