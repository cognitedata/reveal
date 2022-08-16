import { useDeepMemo } from 'hooks/useDeep';

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
  return useDeepMemo(() => {
    if (!options?.fixXValuesToDecimalPlaces) {
      return data;
    }

    return fixValuesToDecimalPlaces<T>(
      data,
      xAccessor,
      options?.fixXValuesToDecimalPlaces
    );
  }, [data]);
};
