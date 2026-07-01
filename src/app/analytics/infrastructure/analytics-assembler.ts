import { AnalyticsStat } from '../domain/model/analytics-stat.entity';
import { EquipmentResource, EquipmentUsageStatResource } from './analytics-response';

/**
 * AnalyticsStat is a read-model joining two REST resources (usage stats +
 * equipments), so it can't implement the single-resource BaseAssembler
 * contract used elsewhere (e.g. gym/EquipmentAssembler). Stats without a
 * matching equipment are dropped rather than emitted with blank fields.
 */
export class AnalyticsAssembler {
  toEntitiesFromResources(
    stats: EquipmentUsageStatResource[],
    equipments: EquipmentResource[]
  ): AnalyticsStat[] {
    return stats
      .map(stat => this.toEntityFromResources(stat, equipments))
      .filter((stat): stat is AnalyticsStat => stat !== null);
  }

  private toEntityFromResources(
    stat: EquipmentUsageStatResource,
    equipments: EquipmentResource[]
  ): AnalyticsStat | null {
    const equipment = equipments.find(e => e.id === stat.equipment_id);
    if (!equipment) return null;

    return new AnalyticsStat({
      id:                 stat.id,
      equipmentId:        stat.equipment_id,
      equipmentName:      equipment.equipmentName,
      zoneId:             Number(equipment.zoneId) || 0,
      totalUsageHours:    stat.total_usage_hours,
      usageCountDaily:    stat.usage_count_daily,
      estimatedWearLevel: stat.estimated_wear_level,
      status:             equipment.status,
    });
  }
}
