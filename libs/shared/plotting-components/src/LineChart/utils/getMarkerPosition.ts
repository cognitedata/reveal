import { PlotMouseEvent } from 'plotly.js';

import head from 'lodash/head';
import get from 'lodash/get';

export const getMarkerPosition = (plotMouseEvent?: PlotMouseEvent) => {
  if (!plotMouseEvent) {
    return {
      x: 0,
      y: 0,
    };
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
