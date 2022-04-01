import get from 'lodash/get';
import groupBy from 'lodash/groupBy';
import isUndefined from 'lodash/isUndefined';

import { useDeepMemo } from 'hooks/useDeep';

import { Accessors, ScaleRange } from '../types';
import {
  getRangeScaleFactor,
  getSumOfValuesOfObjectsByKey,
  getValidatedValues,
} from '../utils';

export const useXScaleRange = <T>({
  data,
  accessors,
  useGroupedValues = false,
  scaleFactor,
}: {
  data: T[];
  accessors: Accessors;
  useGroupedValues?: boolean;
  scaleFactor?: number;
}): ScaleRange => {
  const { x: xAccessor, y: yAccessor } = accessors;
  const [scaleFactorMin, scaleFactorMax] = getRangeScaleFactor(scaleFactor);

  const getGroupedValues = () => {
    const compactData = data.filter(
      (dataElement) => !isUndefined(get(dataElement, yAccessor))
    );
    const groupedData = groupBy(compactData, yAccessor);
    const xAxisValues = Object.keys(groupedData).map((key) =>
      getSumOfValuesOfObjectsByKey(groupedData[key], xAccessor)
    );
    return xAxisValues;
  };

  const getUngroupedValues = () => {
    const dataXValues = data.map((dataElement) => get(dataElement, xAccessor));
    const xAxisValues = getValidatedValues(dataXValues);
    return xAxisValues;
  };

  return useDeepMemo(() => {
    const xAxisValues = useGroupedValues
      ? getGroupedValues()
      : getUngroupedValues();

    const min = Math.floor(Math.min(...xAxisValues) * scaleFactorMin);
    const max = Math.ceil(Math.max(...xAxisValues) * scaleFactorMax);

    return [min, max];
  }, [data]);
};
