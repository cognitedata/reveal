import { formatOutsideDiameter } from 'domain/wells/casings/internal/transformers/formatOutsideDiameter';
import { CasingAssemblyInternalWithTvd } from 'domain/wells/casings/internal/types';
import { isLiner } from 'domain/wells/casings/internal/utils/isLiner';

import { CasingAssemblyView } from '../types';

export const adaptCasingAssembliesDataToView = (
  wellboreMatchingId: string,
  casingAssemblies: CasingAssemblyInternalWithTvd[]
): CasingAssemblyView[] => {
  return casingAssemblies.map((casingAssembly) => {
    const outsideDiameterFormatted = formatOutsideDiameter(
      casingAssembly.minOutsideDiameter
    );

    return {
      ...casingAssembly,
      wellboreMatchingId,
      outsideDiameterFormatted,
      isLiner: isLiner(casingAssembly),
    };
  });
};
