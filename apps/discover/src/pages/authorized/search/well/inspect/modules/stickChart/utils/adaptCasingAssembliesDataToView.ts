import { CasingAssemblyInternalWithTvd } from 'domain/wells/casings/internal/types';

import { CasingAssemblyView } from '../types';

export const adaptCasingAssembliesDataToView = (
  wellboreMatchingId: string,
  casingAssemblies: CasingAssemblyInternalWithTvd[]
): CasingAssemblyView[] => {
  return casingAssemblies.map((casingAssembly) => {
    return {
      ...casingAssembly,
      wellboreMatchingId,
    };
  });
};
