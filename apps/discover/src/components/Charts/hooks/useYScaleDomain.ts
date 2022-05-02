import get from 'lodash/get';
import uniq from 'lodash/uniq';

import { useDeepMemo } from 'hooks/useDeep';

import { getValidatedValues } from '../utils';

export const useYScaleDomain = <T>(
  data: T[],
  yAccessor: string,
  yScaleDomainCustom?: string[]
) => {
  return useDeepMemo(() => {
    if (yScaleDomainCustom) return yScaleDomainCustom;

    const yScaleValues = data.map((dataElement) => get(dataElement, yAccessor));
    return uniq(getValidatedValues(yScaleValues));
  }, [data, yScaleDomainCustom]);
};
