import { PlotData } from 'plotly.js';

import times from 'lodash/times';

import { DEFAULT_LINE_COLOR, LINE_WIDTH, MARKER_SIZE } from '../constants';
import { LineChartProps } from '../types';
import { getDataAsArray } from './getDataAsArray';
import { getLineName } from './getLineName';

export const adaptToPlotlyPlotData = (
  data: LineChartProps['data'],
  showMarkers: boolean
): Partial<PlotData>[] => {
  return getDataAsArray(data).map(
    ({ x, y, color, name, customData }, index) => {
      const mode = showMarkers ? 'lines+markers' : 'lines';
      const lineColor = color || DEFAULT_LINE_COLOR;
      const markerSize = showMarkers ? MARKER_SIZE : 0;
      const markerSizes = times(x.length).map(() => markerSize);
      const markerLineColors = times(x.length).map(() => 'transparent');

      return {
        mode,
        x,
        y,
        line: {
          width: LINE_WIDTH,
          color: lineColor,
        },
        marker: {
          size: markerSizes,
          opacity: 1,
          line: {
            width: 2,
            color: markerLineColors,
          },
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
