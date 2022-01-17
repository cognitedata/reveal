import { EquipmentType } from 'scarlet/types';

export const transformEquipmentType = (
  type?: string
): EquipmentType | undefined => {
  switch (type) {
    case 'Exchangers':
      return EquipmentType.EXCHANGER;
    case 'Vessels':
      return EquipmentType.VESSEL;
    default:
      return undefined;
  }
};
