import { CasingSchematic } from '@cognite/sdk-wells';

import { UserPreferredUnit } from 'constants/units';

import { CasingSchematicInternal } from '../types';
import { getUniqueCasingAssemblies } from '../utils/getUniqueCasingAssemblies';

import { normalizeCasingAssembly } from './normalizeCasingAssembly';

export const normalizeCasingSchematic = (
  rawCasingSchematic: CasingSchematic,
  userPreferredUnit: UserPreferredUnit
): CasingSchematicInternal => {
  const uniqueCasingAssemblies = getUniqueCasingAssemblies(
    rawCasingSchematic.casingAssemblies
  );

  const casingAssemblies = uniqueCasingAssemblies.map((casingAssembly) => {
    return normalizeCasingAssembly(casingAssembly, userPreferredUnit);
  });

  return {
    ...rawCasingSchematic,
    casingAssemblies,
  };
};
