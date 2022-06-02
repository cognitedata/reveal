import {
  EquipmentComponentType,
  EquipmentConfig,
  EquipmentType,
  Formula,
} from 'scarlet/types';

import { getFormulaFields } from '.';

export const getDataElementConfig = (
  config: EquipmentConfig,
  key: string,
  equipmentType: EquipmentType,
  componentType?: EquipmentComponentType
) => {
  const dataElementConfig = componentType
    ? config.componentElements[key]
    : config.equipmentElements[key];

  if (!dataElementConfig) return undefined;

  const { formula } = dataElementConfig;
  const equipmentConfig = config.equipmentTypes[equipmentType];
  if (formula && !validateFormula(formula, equipmentConfig, componentType)) {
    return { ...dataElementConfig, formula: undefined };
  }
  return dataElementConfig;
};

const validateFormula = (
  formula: Formula,
  config: any,
  componentType?: EquipmentComponentType
): boolean =>
  getFormulaFields(formula, componentType).every((item) => {
    const availableKeys = item.componentType
      ? config.componentTypes[item.componentType].componentElementKeys
      : config.equipmentElementKeys;

    return availableKeys.includes(item.field);
  });
