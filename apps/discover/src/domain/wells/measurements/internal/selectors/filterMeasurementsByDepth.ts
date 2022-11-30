import compact from 'lodash/compact';
import isEmpty from 'lodash/isEmpty';

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
  return compact(
    depthMeasurements.map((measurement) => {
      const { rows, depthRange: depthRangeOriginal } = measurement;

      const filteredRows = filterMeasurementRowsByDepth(rows, { min, max });

      if (isEmpty(filteredRows)) {
        return null;
      }

      const depthRange = depthRangeOriginal && {
        ...depthRangeOriginal,
        ...getRowsDepthRange(filteredRows),
      };

      return {
        ...measurement,
        depthRange,
        rows: filteredRows,
      };
    })
  );
};
