import { CasingSchematic } from '@cognite/sdk-wells';

import { UserPreferredUnit } from 'constants/units';

import { CasingSchematicInternal } from '../types';

import { normalizeCasingAssembly } from './normalizeCasingAssembly';

export const normalizeCasingSchematic = (
  rawCasingSchematic: CasingSchematic,
  userPreferredUnit: UserPreferredUnit
): CasingSchematicInternal => {
  const casingAssemblies = rawCasingSchematic.casingAssemblies.map(
    (casingAssembly) => {
      return normalizeCasingAssembly(casingAssembly, userPreferredUnit);
    }
  );

  return {
    ...rawCasingSchematic,
    casingAssemblies,
  };
};
