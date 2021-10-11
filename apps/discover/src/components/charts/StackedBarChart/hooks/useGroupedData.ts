import { useMemo } from 'react';

import groupBy from 'lodash/groupBy';

import { Axis, GroupedData, StackedBarChartOptions } from '../types';
import { sumObjectsByKey } from '../utils';

export const useGroupedData = <T>({
  data,
  xAxis,
  yAxis,
  groupDataInsideBarsBy,
  options,
}: {
  data: T[];
  xAxis: Axis;
  yAxis: Axis;
  groupDataInsideBarsBy?: string;
  options?: StackedBarChartOptions<T>;
}) => {
  return useMemo(() => {
    const groupedDataWithoutSummedValues = groupBy(data, yAxis.accessor);

    if (!groupDataInsideBarsBy) return groupedDataWithoutSummedValues;

    const dataWithSummedValues: GroupedData<T> = {};

    Object.keys(groupedDataWithoutSummedValues).forEach((key) => {
      dataWithSummedValues[key] = sumObjectsByKey<T>(
        groupedDataWithoutSummedValues[key],
        groupDataInsideBarsBy as keyof T,
        xAxis.accessor as keyof T,
        options?.fixXValuesToDecimalPlaces
      );
    });

    return dataWithSummedValues;
  }, [data]);
};
