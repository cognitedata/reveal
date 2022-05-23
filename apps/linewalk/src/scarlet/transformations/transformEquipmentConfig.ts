import { EquipmentComponentType, EquipmentConfig } from 'scarlet/types';

export const transformEquipmentConfig = (data: any): EquipmentConfig => ({
  creatingAppVersions: data.creating_app_versions || [],
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
        equipmentElementKeys: [
          ...(equipmentType.properties ?? []),
          ...(equipmentType.calculated_properties ?? []),
        ],
        componentTypes: equipmentType.components.reduce(
          (componentResult: any, item: any) => {
            const componentType = getType(item.component_type);
            if (!componentType) return componentResult;

            return {
              ...componentResult,
              [componentType]: {
                type: componentType,
                label: item.label,
                componentElementKeys: [
                  ...(item.properties ?? []),
                  ...(item.calculated_properties ?? []),
                ],
              },
            };
          },
          {}
        ),
      },
    }),
    {}
  ),
});

const getType = (configType: string): EquipmentComponentType | undefined => {
  const type = configType.split('_').pop()?.toLowerCase();

  switch (type) {
    case 'bundle':
      return EquipmentComponentType.BUNDLE;
    case 'head':
      return EquipmentComponentType.HEAD;
    case 'nozzle':
      return EquipmentComponentType.NOZZLE;
    case 'shell':
      return EquipmentComponentType.SHELL;
  }
  return undefined;
};
