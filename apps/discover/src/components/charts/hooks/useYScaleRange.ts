import { useMemo } from 'react';

import compact from 'lodash/compact';
import get from 'lodash/get';
import uniq from 'lodash/uniq';

import { useCompare } from 'hooks/useCompare';

import { ScaleRange } from '../types';
import { getRangeScaleFactor } from '../utils';

export const useYScaleRange = <T>({
  data,
  yAccessor,
  scaleFactor,
}: {
  data: T[];
  yAccessor: string;
  scaleFactor?: number;
}): ScaleRange => {
  const [scaleFactorMin, scaleFactorMax] = getRangeScaleFactor(scaleFactor);

  return useMemo(() => {
    const yAxisValues = uniq(
      compact(data.map((dataElement) => get(dataElement, yAccessor)))
    );

    const min = Math.floor(Math.min(...yAxisValues) * scaleFactorMin);
    const max = Math.ceil(Math.max(...yAxisValues) * scaleFactorMax);

    return [min, max];
  }, useCompare([data]));
};
