import { formatOutsideDiameter } from 'domain/wells/casings/internal/transformers/formatOutsideDiameter';
import { CasingAssemblyInternal } from 'domain/wells/casings/internal/types';
import { isLiner } from 'domain/wells/casings/internal/utils/isLiner';

import { CasingAssemblyView } from '../types';

export const adaptCasingAssembliesDataToView = (
  casingAssemblies: CasingAssemblyInternal[]
): CasingAssemblyView[] => {
  return casingAssemblies.map((casingAssembly) => {
    const outsideDiameterFormatted = formatOutsideDiameter(casingAssembly);

    return {
      ...casingAssembly,
      outsideDiameterFormatted,
      isLiner: isLiner(casingAssembly),
    };
  });
};
