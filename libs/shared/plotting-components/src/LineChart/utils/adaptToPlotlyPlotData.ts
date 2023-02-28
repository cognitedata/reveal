import { PlotData } from 'plotly.js';

import { DEFAULT_LINE_COLOR, LINE_WIDTH } from '../constants';
import { LineChartProps } from '../types';
import { getDataAsArray } from './getDataAsArray';
import { getLineName } from './getLineName';

export const adaptToPlotlyPlotData = (
  data: LineChartProps['data']
): Partial<PlotData>[] => {
  return getDataAsArray(data).map(({ x, y, color, name }, index) => {
    return {
      mode: 'lines',
      x,
      y,
      line: {
        width: LINE_WIDTH,
        color: color || DEFAULT_LINE_COLOR,
      },
      name: getLineName(name, index),
    };
  });
};
