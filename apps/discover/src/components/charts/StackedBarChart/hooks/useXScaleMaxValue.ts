import { useMemo } from 'react';

import { GroupedData } from '../types';
import { getSumOfValuesOfObjectsByKey } from '../utils';

export const useXScaleMaxValue = <T>({
  groupedData,
  xAccessor,
}: {
  groupedData: GroupedData<T>;
  xAccessor: keyof T;
}) => {
  return useMemo(() => {
    let xAxisValues: number[] = [];

    Object.keys(groupedData).forEach((key) => {
      xAxisValues = xAxisValues.concat(
        getSumOfValuesOfObjectsByKey<T>(groupedData[key], xAccessor)
      );
    });

    return Math.ceil(Math.max(...xAxisValues));
  }, [groupedData]);
};
