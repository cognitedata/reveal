import { EquipmentComponentType } from 'types';

const getComponentTypeOfPcmsType = (type: string) => {
  switch (type) {
    case 'HEXSS':
    case 'DRUM':
    case 'FILTER':
    case 'STACK':
    case 'REACTOR':
    case 'COLTOP':
    case 'COLMID':
    case 'COLBTM':
      return EquipmentComponentType.SHELL;
    case 'HEADER BOX':
      return EquipmentComponentType.HEAD;
    case 'TUBE':
    case 'CONTUBE':
    case 'RADTUBE':
      return EquipmentComponentType.BUNDLE;
    default:
      return undefined;
  }
};

export { getComponentTypeOfPcmsType };
