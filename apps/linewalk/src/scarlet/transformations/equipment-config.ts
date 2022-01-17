import { EquipmentConfig } from 'scarlet/types';

export const transformEquipmentConfig = (data: any): EquipmentConfig => ({
  equipmentElements: data.equipment_properties.reduce(
    (result: any, item: any) => ({ ...result, [item.key]: item }),
    {}
  ),
  componentElements: data.component_properties.reduce(
    (result: any, item: any) => ({ ...result, [item.key]: item }),
    {}
  ),
  equipmentTypes: data.equipment_types.reduce(
    (result: any, equipmentType: any) => ({
      ...result,
      [equipmentType.equipment_type]: {
        type: equipmentType.equipment_type,
        label: equipmentType.label,
        equipmentElementKeys: equipmentType.properties,
        componentTypes: equipmentType.components.reduce(
          (componentResult: any, componentType: any) => ({
            ...componentResult,
            [componentType.component_type]: {
              type: componentType.component_type,
              label: componentType.label,
              componentElementKeys: equipmentType.properties,
            },
          }),
          {}
        ),
      },
    }),
    {}
  ),
});
