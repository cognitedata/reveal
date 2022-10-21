import { EquipmentType } from 'types';

export const getEquipmentType = (pcmsType: string) => {
  switch (pcmsType) {
    case 'Exchanger - Air Cooled':
      return EquipmentType.AIR_COOLER;
    case 'Boiler - Fired':
    case 'Boiler - Unfired':
    case 'Boiler - Process Steam Generator':
    case 'EXCHANGER - Double Pipe':
    case 'EXCHANGER - Plate/Frame':
    case 'EXCHANGER - Shell/Tube':
      return EquipmentType.EXCHANGER;
    case 'Filter/Strainer':
    case 'Flare/Stack':
    case 'Tower':
    case 'Drum':
    case 'Tank':
      return EquipmentType.VESSEL;
    default:
      return undefined;
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
