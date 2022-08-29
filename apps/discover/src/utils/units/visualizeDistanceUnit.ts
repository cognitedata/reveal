import { Distance } from 'convert-units';

export const visualizeDistanceUnit = (unit: Distance): string => {
  switch (unit) {
    case 'ft' || 'ft-us':
      return `'`;

    case 'in':
      return `"`;

    default:
      return unit;
  }
};
