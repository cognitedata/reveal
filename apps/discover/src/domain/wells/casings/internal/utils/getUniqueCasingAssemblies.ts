import uniqBy from 'lodash/uniqBy';

import { CasingAssembly } from '@cognite/sdk-wells';

import { CasingAssemblyInternal } from '../types';

type CasingAssemblyType =
  | Pick<CasingAssembly, 'minOutsideDiameter'>
  | Pick<CasingAssemblyInternal, 'minOutsideDiameter'>;

export const getUniqueCasingAssemblies = <T extends CasingAssemblyType>(
  casingAssemblies: T[]
): T[] => {
  return uniqBy(casingAssemblies, 'minOutsideDiameter.value');
};
