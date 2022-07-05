import { DataElementState, EquipmentData } from 'types';

export const getEquipmentProgress = (equipment?: EquipmentData) => {
  if (!equipment) return undefined;
  let total = 0;
  let completed = 0;
  total += equipment.equipmentElements.length;
  completed += equipment.equipmentElements.filter(
    (dataElement) => dataElement.state !== DataElementState.PENDING
  ).length;

  if (!equipment.components.length) {
    total *= 2;
  } else {
    equipment.components.forEach((component) => {
      total += component.componentElements.length;
      completed += component.componentElements.filter(
        (dataElement) => dataElement.state !== DataElementState.PENDING
      ).length;
    });
  }

  const result = total ? (completed / total) * 100 : 0;
  return result < 50 ? Math.ceil(result) : Math.floor(result);
};
