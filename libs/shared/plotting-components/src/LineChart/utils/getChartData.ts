import { DEFAULT_LINE_COLOR, LINE_WIDTH } from '../constants';
import { Data } from '../types';
import { getDataAsArray } from './getDataAsArray';

export const getChartData = (data: Data | Data[]) => {
  return getDataAsArray(data).map(({ x, y, color }) => {
    return {
      mode: 'lines',
      x,
      y,
      line: {
        width: LINE_WIDTH,
        color: color || DEFAULT_LINE_COLOR,
      },
    };
  });
};
