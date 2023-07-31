import { toReadableInches } from 'utils/number/toReadableInches';
import { ConvertedDistance } from 'utils/units/constants';

import { CASING_ASSEMBLY_DIAMETER_UNIT } from '../constants';

export const formatDiameter = (diameter: ConvertedDistance) => {
  const { value, unit } = diameter;

  if (unit === CASING_ASSEMBLY_DIAMETER_UNIT) {
    return toReadableInches(value);
  }

  return `${value} ${unit}`;
};
