import { useMemo } from 'react';

import { Axis, StackedBarChartOptions } from '../types';
import { fixValuesToDecimalPlaces } from '../utils';

export const useProcessedData = <T>({
  data,
  xAxis,
  options,
}: {
  data: T[];
  xAxis: Axis;
  options?: StackedBarChartOptions<T>;
}) => {
  return useMemo(() => {
    if (options?.fixXValuesToDecimalPlaces) {
      return fixValuesToDecimalPlaces<T>(
        data,
        xAxis.accessor as keyof T,
        options?.fixXValuesToDecimalPlaces
      );
    }

    return data;
  }, [data]);
};
