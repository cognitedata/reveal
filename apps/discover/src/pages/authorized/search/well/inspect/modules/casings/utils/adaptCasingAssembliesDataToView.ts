import { formatOutsideDiameter } from 'domain/wells/casings/internal/transformers/formatOutsideDiameter';
import { CasingAssemblyInternal } from 'domain/wells/casings/internal/types';
import { isLiner } from 'domain/wells/casings/internal/utils/isLiner';
import { TrueVerticalDepthsDataLayer } from 'domain/wells/trajectory0/internal/types';

import { CasingAssemblyView } from '../types';

import { getCasingAssemblyTvdData } from './getCasingAssemblyTvdData';

export const adaptCasingAssembliesDataToView = (
  casingAssemblies: CasingAssemblyInternal[],
  trueVerticalDepths?: TrueVerticalDepthsDataLayer
): CasingAssemblyView[] => {
  return casingAssemblies.map((casingAssembly) => {
    const outsideDiameterFormatted = formatOutsideDiameter(casingAssembly);

    return {
      ...casingAssembly,
      ...getCasingAssemblyTvdData(casingAssembly, trueVerticalDepths),
      outsideDiameterFormatted,
      isLiner: isLiner(casingAssembly),
    };
  });
};
