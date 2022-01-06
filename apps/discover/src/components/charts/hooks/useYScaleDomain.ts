import compact from 'lodash/compact';
import get from 'lodash/get';
import uniq from 'lodash/uniq';

import { useDeepMemo } from 'hooks/useDeep';

export const useYScaleDomain = <T>(
  data: T[],
  yAccessor: string,
  yScaleDomainCustom?: string[]
) => {
  return useDeepMemo(() => {
    if (yScaleDomainCustom) return yScaleDomainCustom;
    const yScaleValues = data.map((dataElement) => get(dataElement, yAccessor));
    return uniq(compact(yScaleValues));
  }, [data, yScaleDomainCustom]);
};
