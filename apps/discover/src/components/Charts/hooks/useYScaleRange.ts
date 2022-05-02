import get from 'lodash/get';
import uniq from 'lodash/uniq';

import { useDeepMemo } from 'hooks/useDeep';

import { ScaleRange } from '../types';
import { getRangeScaleFactor, getValidatedValues } from '../utils';

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

  return useDeepMemo(() => {
    const dataYValues = data.map((dataElement) => get(dataElement, yAccessor));
    const yAxisValues = uniq(getValidatedValues(dataYValues));

    const min = Math.floor(Math.min(...yAxisValues) * scaleFactorMin);
    const max = Math.ceil(Math.max(...yAxisValues) * scaleFactorMax);

    return [min, max];
  }, [data]);
};
