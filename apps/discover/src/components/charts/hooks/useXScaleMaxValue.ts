import { useMemo } from 'react';

import groupBy from 'lodash/groupBy';

import { getSumOfValuesOfObjectsByKey } from '../utils';

export const useXScaleMaxValue = <T>({
  data,
  accessors,
}: {
  data: T[];
  accessors: { x: string; y: string };
}) => {
  const { x: xAccessor, y: yAccessor } = accessors;

  return useMemo(() => {
    const groupedData = groupBy(data, yAccessor);
    const xAxisValues = Object.keys(groupedData).map((key) =>
      getSumOfValuesOfObjectsByKey(groupedData[key], xAccessor)
    );

    return Math.ceil(Math.max(...xAxisValues));
  }, [data]);
};
