import get from 'lodash/get';
import { PlotMouseEvent } from 'plotly.js';
import { getMarkerPosition } from './getMarkerPosition';

const TOOLTIP_HORIZONTAL_MARGIN = 16;

export const getTooltipPosition = (
  plotMouseEvent?: PlotMouseEvent,
  tooltipWidth?: number
) => {
  if (!plotMouseEvent || !tooltipWidth) {
    return {
      x: 0,
      y: 0,
    };
  }

  const chartWidth = get(
    plotMouseEvent.event.target,
    'viewportElement.clientWidth',
    0
  );

  const { x = 0, y = 0 } = getMarkerPosition(plotMouseEvent);

  return {
    x:
      chartWidth - (x + TOOLTIP_HORIZONTAL_MARGIN) < tooltipWidth
        ? x - tooltipWidth - TOOLTIP_HORIZONTAL_MARGIN
        : x + TOOLTIP_HORIZONTAL_MARGIN,
    y,
  };
};
