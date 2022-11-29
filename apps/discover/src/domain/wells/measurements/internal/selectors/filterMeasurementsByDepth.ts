import { DepthMeasurementWithData } from '../types';

import { filterMeasurementRowsByDepth } from './filterMeasurementRowsByDepth';
import { getRowsDepthRange } from './getRowsDepthRange';

type MeasurementType = Pick<DepthMeasurementWithData, 'rows' | 'depthRange'>;

export const filterMeasurementsByDepth = <T extends MeasurementType>(
  depthMeasurements: T[],
  {
    min,
    max,
  }: {
    min?: number;
    max?: number;
  }
): T[] => {
  return depthMeasurements.map((measurement) => {
    const { rows, depthRange: depthRangeOriginal } = measurement;

    const filteredRows = filterMeasurementRowsByDepth(rows, { min, max });

    const depthRange = depthRangeOriginal && {
      ...depthRangeOriginal,
      ...getRowsDepthRange(filteredRows),
    };

    return {
      ...measurement,
      depthRange,
      rows: filteredRows,
    };
  });
};
