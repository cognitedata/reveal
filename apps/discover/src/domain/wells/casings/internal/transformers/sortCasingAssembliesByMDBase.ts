import { sortObjectsAscending, sortObjectsDecending } from 'utils/sort';

import { CasingAssemblyInternal } from '../types';

type CasingAssemblyType = Pick<CasingAssemblyInternal, 'measuredDepthBase'>;

const MD_BASE_VALUE_ACCESSOR = 'measuredDepthBase.value';

export const sortCasingAssembliesByMDBase = <T extends CasingAssemblyType>(
  casingAssemblies: T[],
  desc = false
) => {
  if (desc) {
    return sortObjectsDecending<CasingAssemblyType>(
      casingAssemblies,
      MD_BASE_VALUE_ACCESSOR
    ) as T[];
  }

  return sortObjectsAscending<CasingAssemblyType>(
    casingAssemblies,
    MD_BASE_VALUE_ACCESSOR
  ) as T[];
};
