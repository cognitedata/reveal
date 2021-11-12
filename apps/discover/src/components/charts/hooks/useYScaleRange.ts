import { useMemo } from 'react';

import compact from 'lodash/compact';
import get from 'lodash/get';
import uniq from 'lodash/uniq';

import { ScaleRange } from '../types';

export const useYScaleRange = <T>({
  data,
  yAccessor,
}: {
  data: T[];
  yAccessor: string;
}): ScaleRange => {
  return useMemo(() => {
    const yAxisValues = uniq(
      compact(data.map((dataElement) => get(dataElement, yAccessor)))
    );

    const min = Math.floor(Math.min(...yAxisValues));
    const max = Math.ceil(Math.max(...yAxisValues));

    return [min, max];
  }, [data]);
};
