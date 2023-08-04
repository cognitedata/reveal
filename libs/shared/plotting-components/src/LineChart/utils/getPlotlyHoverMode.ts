import { Layout as PlotlyLayout } from 'plotly.js';

import { HoverMode } from '../types';

export const getPlotlyHoverMode = (
  hoverMode: HoverMode,
  numberOfLines: number
): PlotlyLayout['hovermode'] | undefined => {
  /**
   * If there are multiple lines in the chart,
   * We should set hover mode to closest.
   * Otherwise it's hard to hover on lines if they overlap.
   */
  if (numberOfLines > 1) {
    return 'closest';
  }

  switch (hoverMode) {
    case 'data-point':
      return 'closest';

    case 'x':
      return 'x';

    default:
      return undefined;
  }
};
