import { UserPreferredUnit } from 'constants/units';

import {
  CasingSchematicInternalWithTvd,
  CasingSchematicWithTvd,
} from '../types';
import { getUniqueCasingAssemblies } from '../utils/getUniqueCasingAssemblies';

import { normalizeCasingAssemblyWithTvd } from './normalizeCasingAssemblyWithTvd';

export const normalizeCasingSchematicWithTvd = (
  rawCasingSchematic: CasingSchematicWithTvd,
  userPreferredUnit: UserPreferredUnit
): CasingSchematicInternalWithTvd => {
  const uniqueCasingAssemblies = getUniqueCasingAssemblies(
    rawCasingSchematic.casingAssemblies
  );

  const casingAssemblies = uniqueCasingAssemblies.map((casingAssembly) => {
    return normalizeCasingAssemblyWithTvd(casingAssembly, userPreferredUnit);
  });

  return {
    ...rawCasingSchematic,
    casingAssemblies: getUniqueCasingAssemblies(casingAssemblies),
  };
};
