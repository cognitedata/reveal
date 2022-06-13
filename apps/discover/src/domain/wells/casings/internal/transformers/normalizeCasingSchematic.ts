import { CasingSchematic } from '@cognite/sdk-wells-v3';

import { UserPreferredUnit } from 'constants/units';

import { CasingSchematicInternal } from '../types';

import { normalizeCasingAssembly } from './normalizeCasingAssembly';

export const normalizeCasingSchematic = (
  rawCasingSchematic: CasingSchematic,
  userPreferredUnit: UserPreferredUnit
): CasingSchematicInternal => {
  const { casingAssemblies } = rawCasingSchematic;

  return {
    ...rawCasingSchematic,
    casingAssemblies: casingAssemblies.map((casingAssembly) =>
      normalizeCasingAssembly(casingAssembly, userPreferredUnit)
    ),
  };
};
