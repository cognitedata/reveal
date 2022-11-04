import { EquipmentType } from 'types';

export const getEquipmentType = (typeName: string) => {
  switch (typeName.toLocaleLowerCase()) {
    case 'exchanger - air cooled':
      return EquipmentType.AIR_COOLER;
    case 'boiler - fired':
    case 'boiler - unfired':
    case 'boiler - process steam generator':
    case 'exchanger - double pipe':
    case 'exchanger - plate/frame':
    case 'exchanger - shell/tube':
      return EquipmentType.EXCHANGER;
    case 'filter/strainer':
    case 'flare/stack':
    case 'tower':
    case 'drum':
    case 'tank':
      return EquipmentType.VESSEL;
    default:
      return undefined;
  }
};
