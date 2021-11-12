import { useMemo } from 'react';

import compact from 'lodash/compact';
import get from 'lodash/get';
import groupBy from 'lodash/groupBy';
import isUndefined from 'lodash/isUndefined';

import { Accessors, ScaleRange } from '../types';
import { getSumOfValuesOfObjectsByKey } from '../utils';

export const useXScaleRange = <T>({
  data,
  accessors,
  useGroupedValues = false,
}: {
  data: T[];
  accessors: Accessors;
  useGroupedValues?: boolean;
}): ScaleRange => {
  const { x: xAccessor, y: yAccessor } = accessors;

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
    const xAxisValues = compact(
      data.map((dataElement) => get(dataElement, xAccessor))
    );
    return xAxisValues;
  };

  return useMemo(() => {
    const xAxisValues = useGroupedValues
      ? getGroupedValues()
      : getUngroupedValues();

    const min = Math.floor(Math.min(...xAxisValues));
    const max = Math.ceil(Math.max(...xAxisValues));

    return [min, max];
  }, [data]);
};
