import { EquipmentType } from 'types';

export const getEquipmentType = (equipmentId: string) => {
  const typeId = equipmentId.split('-')[0];
  switch (typeId) {
    case '24':
      return EquipmentType.AIR_COOLER;
    case '07':
    case '41':
      return EquipmentType.EXCHANGER;
    default:
      return EquipmentType.VESSEL;
  }
};

export const getEquipmentTypeLabel = (type: EquipmentType) => {
  switch (type) {
    case EquipmentType.AIR_COOLER:
      return 'Air cooler';
    case EquipmentType.EXCHANGER:
      return 'Exchanger';
    case EquipmentType.VESSEL:
      return 'Vessel';
  }
  return undefined;
};
