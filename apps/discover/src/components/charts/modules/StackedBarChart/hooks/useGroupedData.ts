import { useMemo } from 'react';

import groupBy from 'lodash/groupBy';

import { Accessors, GroupedData } from 'components/charts/types';

import { StackedBarChartOptions } from '../types';
import { sumObjectsByKey } from '../utils';

import { useProcessedData } from './useProcessedData';

export const useGroupedData = <T>({
  data,
  accessors,
  groupDataInsideBarsBy,
  options,
}: {
  data: T[];
  accessors: Accessors;
  groupDataInsideBarsBy?: string;
  options?: StackedBarChartOptions<T>;
}) => {
  const { x: xAccessor, y: yAccessor } = accessors;

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
        groupDataInsideBarsBy,
        xAccessor,
        options?.fixXValuesToDecimalPlaces
      );
    });

    return dataWithSummedValues;
  }, [processedData]);
};
