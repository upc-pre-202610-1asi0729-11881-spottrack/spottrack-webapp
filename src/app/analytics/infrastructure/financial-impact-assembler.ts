import { FinancialStat } from '../domain/model/financial-impact.entity';
import { EquipmentResource, EquipmentUsageStatResource } from './financial-impact-response';

/**
 * FinancialStat joins equipments with their (optional) usage stat, so it
 * can't implement the single-resource BaseAssembler contract used elsewhere.
 * Unlike AnalyticsAssembler, every equipment is kept even without a matching
 * usage stat — FinancialImpactStore needs all equipment to compute
 * maintenance-related losses, not just the ones with recorded usage.
 */
export class FinancialImpactAssembler {
  toEntitiesFromResources(
    equipments: EquipmentResource[],
    usageStats: EquipmentUsageStatResource[]
  ): FinancialStat[] {
    return equipments.map(equipment => this.toEntityFromResources(equipment, usageStats));
  }

  private toEntityFromResources(
    equipment: EquipmentResource,
    usageStats: EquipmentUsageStatResource[]
  ): FinancialStat {
    const stat = usageStats.find(s => s.equipment_id === equipment.id);

    return new FinancialStat({
      id:              equipment.id,
      equipmentId:     equipment.id,
      equipmentName:   equipment.equipmentName,
      status:          equipment.status,
      purchasePrice:   equipment.purchaseAmount,
      usageCountDaily: stat?.usage_count_daily ?? 0,
      totalUsageHours: stat?.total_usage_hours ?? 0,
    });
  }
}
