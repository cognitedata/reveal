import { useMemo } from 'react';

import { StackedBarChartOptions } from '../types';
import { fixValuesToDecimalPlaces } from '../utils';

export const useProcessedData = <T>({
  data,
  xAccessor,
  options,
}: {
  data: T[];
  xAccessor: string;
  options?: StackedBarChartOptions<T>;
}) => {
  return useMemo(() => {
    if (options?.fixXValuesToDecimalPlaces) {
      return fixValuesToDecimalPlaces<T>(
        data,
        xAccessor,
        options?.fixXValuesToDecimalPlaces
      );
    }

    return data;
  }, [data]);
};
