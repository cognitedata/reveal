import isNumber from 'lodash/isNumber';

import { PlotRange, Data, ValueType } from '../types';
import { getDataAsArray } from './getDataAsArray';

export const getPlotRange = (data: Data | Data[]): Required<PlotRange> => {
  const { x, y } = getDataAsArray(data).reduce<{
    x: number[];
    y: number[];
  }>(
    (result, { x, y }) => {
      return {
        x: [...result.x, ...x.map(getPointValue)],
        y: [...result.y, ...y.map(getPointValue)],
      };
    },
    { x: [], y: [] }
  );

  return {
    x: [Math.min(...x), Math.max(...x)],
    y: [Math.min(...y), Math.max(...y)],
  };
};

export const getPointValue = (value: ValueType, index: number): number => {
  if (isNumber(value)) {
    return value;
  }
  return index;
};
