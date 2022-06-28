import { convertValue } from './convertValue';

export const getUnitConverter =
  (unit?: string, preferredUnit?: string) => (val?: number) => {
    return typeof val === 'number'
      ? convertValue(val, unit, preferredUnit)
      : NaN;
  };
