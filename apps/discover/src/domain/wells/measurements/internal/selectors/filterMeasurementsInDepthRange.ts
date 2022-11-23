import isEmpty from 'lodash/isEmpty';
import { minMax } from 'utils/number';

import { DepthIndexTypeEnum, DepthMeasurementRow } from '@cognite/sdk-wells';

import { DepthMeasurementWithData } from '../types';

import { filterMeasurementRowsInDepthRange } from './filterMeasurementRowsInDepthRange';

type DepthRange = {
  min?: number;
  max?: number;
};

type DepthRangeFilter = {
  measuredDepth: DepthRange;
  trueVerticalDepth?: DepthRange;
};

export const DEPTH_INDEX_FILTER_MAP: Record<
  DepthIndexTypeEnum,
  keyof DepthRangeFilter
> = {
  'measured depth': 'measuredDepth',
  'true vertical depth': 'trueVerticalDepth',
};

export const filterMeasurementsInDepthRange = (
  data: DepthMeasurementWithData[],
  filter: DepthRangeFilter
): DepthMeasurementWithData[] => {
  return data.map((measurement) => {
    const { depthColumn, rows, depthRange: depthRangeOriginal } = measurement;

    const filterRange = filter[DEPTH_INDEX_FILTER_MAP[depthColumn.type]];

    const filteredRows = filterRange
      ? filterMeasurementRowsInDepthRange(rows, filterRange)
      : rows;

    const depthRange = depthRangeOriginal && {
      ...depthRangeOriginal,
      ...getNewDepthRange(filteredRows),
    };

    return {
      ...measurement,
      depthRange,
      rows: filteredRows,
    };
  });
};

const getNewDepthRange = (filteredRows: DepthMeasurementRow[]) => {
  if (isEmpty(filteredRows)) {
    return {
      min: undefined,
      max: undefined,
    };
  }

  const [min, max] = minMax(filteredRows.map(({ depth }) => depth));

  return { min, max };
};
