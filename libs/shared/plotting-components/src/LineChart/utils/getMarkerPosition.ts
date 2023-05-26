import get from 'lodash/get';
import head from 'lodash/head';
import { PlotMouseEvent } from 'plotly.js';

import { Coordinate } from '../types';

export const getMarkerPosition = (
  plotMouseEvent?: PlotMouseEvent
): Coordinate => {
  if (!plotMouseEvent) {
    return {};
  }

  const bbox = get(head(plotMouseEvent.points), 'bbox') as
    | Record<string, number>
    | undefined;

  if (!bbox) {
    return {};
  }

  const { x0, x1, y0, y1 } = bbox;

  return {
    x: (x0 + x1) / 2,
    y: (y0 + y1) / 2,
  };
};
