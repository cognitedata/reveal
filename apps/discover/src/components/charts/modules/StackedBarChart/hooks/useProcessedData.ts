import { useMemo } from 'react';

import { useCompare } from 'hooks/useCompare';

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
    if (!options?.fixXValuesToDecimalPlaces) return data;

    return fixValuesToDecimalPlaces<T>(
      data,
      xAccessor,
      options?.fixXValuesToDecimalPlaces
    );
  }, useCompare([data]));
};
