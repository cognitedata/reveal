import { ConvertedDistance } from 'utils/units/constants';

import { CASING_ASSEMBLY_DIAMETER_UNIT } from '../constants';
import { CasingAssemblyInternal } from '../types';

type CasingAssemblyType = Pick<
  CasingAssemblyInternal,
  'minInsideDiameter' | 'maxOutsideDiameter'
>;

export const getCasingThickness = <T extends CasingAssemblyType>(
  casingAssembly: T
): ConvertedDistance => {
  const { minInsideDiameter, maxOutsideDiameter } = casingAssembly;

  const thickness = maxOutsideDiameter.value - minInsideDiameter.value;

  return {
    value: thickness,
    unit: CASING_ASSEMBLY_DIAMETER_UNIT,
  };
};
