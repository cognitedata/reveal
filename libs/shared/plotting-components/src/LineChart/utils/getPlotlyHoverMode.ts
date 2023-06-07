import { Layout as PlotlyLayout } from 'plotly.js';

import { HoverMode } from '../types';

export const getPlotlyHoverMode = (
  hoverMode: HoverMode
): PlotlyLayout['hovermode'] | undefined => {
  switch (hoverMode) {
    case 'data-point':
      return 'closest';

    case 'x':
      return 'x';

    default:
      return undefined;
  }
};
