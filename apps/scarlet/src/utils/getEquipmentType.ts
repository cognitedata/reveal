import { EquipmentType } from 'types';

export const getEquipmentType = (typeName: string) => {
  switch (typeName.toLocaleLowerCase()) {
    case 'exchanger - air cooled':
      return EquipmentType.EXCHANGER_AIR_COOLED;
    case 'boiler - fired':
    case 'boiler - unfired':
    case 'boiler - process steam generator':
      return EquipmentType.BOILER_PROCESS_STEAM_GENERATOR;
    case 'exchanger - double pipe':
      return EquipmentType.EXCHANGER_DOUBLE_PIPE;
    case 'exchanger - plate/frame':
    case 'exchanger - shell/tube':
      return EquipmentType.EXCHANGER_SHELL_TUBE;
    case 'filter/strainer':
      return EquipmentType.FILTER_STRAINER;
    case 'flare/stack':
      return EquipmentType.FLARE_STACK;
    case 'tower':
      return EquipmentType.TOWER;
    case 'drum':
      return EquipmentType.DRUM;
    case 'tank':
      return EquipmentType.VESSEL;
    case 'reactor':
      return EquipmentType.REACTOR;
    case 'incinerator':
      return EquipmentType.INCINERATOR;
    default:
      return undefined;
  }
};
