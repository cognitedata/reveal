import { UserPreferredUnit } from 'constants/units';

import {
  CasingSchematicInternalWithTvd,
  CasingSchematicWithTvd,
} from '../types';

import { normalizeCasingAssemblyWithTvd } from './normalizeCasingAssemblyWithTvd';

export const normalizeCasingSchematicWithTvd = (
  rawCasingSchematic: CasingSchematicWithTvd,
  userPreferredUnit: UserPreferredUnit
): CasingSchematicInternalWithTvd => {
  const casingAssemblies = rawCasingSchematic.casingAssemblies.map(
    (casingAssembly) => {
      return normalizeCasingAssemblyWithTvd(casingAssembly, userPreferredUnit);
    }
  );

  return {
    ...rawCasingSchematic,
    casingAssemblies,
  };
};
