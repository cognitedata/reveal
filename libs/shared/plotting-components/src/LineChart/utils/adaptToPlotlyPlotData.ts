import { PlotData } from 'plotly.js';

import { DEFAULT_LINE_COLOR, LINE_WIDTH } from '../constants';
import { LineChartProps } from '../types';
import { getDataAsArray } from './getDataAsArray';
import { getLineName } from './getLineName';

export const adaptToPlotlyPlotData = (
  data: LineChartProps['data'],
  showMarkers: boolean
): Partial<PlotData>[] => {
  return getDataAsArray(data).map(
    ({ x, y, color, name, customData }, index) => {
      return {
        mode: showMarkers ? 'lines+markers' : 'lines',
        x,
        y,
        line: {
          width: LINE_WIDTH,
          color: color || DEFAULT_LINE_COLOR,
        },
        marker: {
          size: showMarkers ? 8 : 0,
        },
        name: getLineName(name, index),
        hoverinfo: 'none',
        unselected: {
          marker: {
            opacity: 1,
          },
        },
        customData,
      };
    }
  );
};
