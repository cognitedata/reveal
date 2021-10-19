import { useMemo } from 'react';

import groupBy from 'lodash/groupBy';

import { GroupedData, StackedBarChartOptions } from '../types';
import { sumObjectsByKey } from '../utils';

import { useProcessedData } from './useProcessedData';

export const useGroupedData = <T>({
  data,
  xAccessor,
  yAccessor,
  groupDataInsideBarsBy,
  options,
}: {
  data: T[];
  xAccessor: keyof T;
  yAccessor: keyof T;
  groupDataInsideBarsBy?: string;
  options?: StackedBarChartOptions<T>;
}) => {
  const processedData = useProcessedData<T>({
    data,
    xAccessor,
    options,
  });

  return useMemo(() => {
    const groupedDataWithoutSummedValues = groupBy(processedData, yAccessor);

    if (!groupDataInsideBarsBy) return groupedDataWithoutSummedValues;

    const dataWithSummedValues: GroupedData<T> = {};

    Object.keys(groupedDataWithoutSummedValues).forEach((key) => {
      dataWithSummedValues[key] = sumObjectsByKey<T>(
        groupedDataWithoutSummedValues[key],
        groupDataInsideBarsBy as keyof T,
        xAccessor,
        options?.fixXValuesToDecimalPlaces
      );
    });

    return dataWithSummedValues;
  }, [processedData]);
};
