import { toFraction } from 'utils/number';

import { CASING_ASSEMBLY_DIAMETER_UNIT } from '../constants';
import { CasingAssemblyInternal } from '../types';

type CasingOutsideDiameter = Pick<CasingAssemblyInternal, 'minOutsideDiameter'>;

export const formatOutsideDiameter = <T extends CasingOutsideDiameter>(
  casingAssembly: T
) => {
  const { value, unit } = casingAssembly.minOutsideDiameter;

  const fraction = toFraction(value).replace(/\s+/g, '-');

  if (unit === CASING_ASSEMBLY_DIAMETER_UNIT) {
    return `${fraction}"`;
  }

  return `${fraction} ${unit}`;
};
