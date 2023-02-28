import get from 'lodash/get';
import { PlotMouseEvent } from 'plotly.js';
import { getMarkerPosition } from './getMarkerPosition';

const TOOLTIP_HORIZONTAL_MARGIN = 16;

export const getTooltipPosition = (
  plotMouseEvent?: PlotMouseEvent,
  tooltipWidth?: number,
  tooltipHeight?: number
) => {
  if (!plotMouseEvent || !tooltipWidth || !tooltipHeight) {
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

  const chartHeight = get(
    plotMouseEvent.event.target,
    'viewportElement.clientHeight',
    0
  );

  const { x = 0, y = 0 } = getMarkerPosition(plotMouseEvent);

  return {
    x: calculateTooltipPositionX(x, tooltipWidth, chartWidth),
    y: calculateTooltipPositionY(y, tooltipHeight, chartHeight),
  };
};

export const calculateTooltipPositionX = (
  markerX: number,
  tooltipWidth: number,
  chartWidth: number
) => {
  let x = markerX + TOOLTIP_HORIZONTAL_MARGIN;

  if (chartWidth - x < tooltipWidth) {
    x = markerX - tooltipWidth - TOOLTIP_HORIZONTAL_MARGIN;
  }

  return x;
};

export const calculateTooltipPositionY = (
  markerY: number,
  tooltipHeight: number,
  chartHeight: number
) => {
  const tooltipHeightHalf = tooltipHeight / 2;

  if (markerY < tooltipHeightHalf) {
    return tooltipHeightHalf;
  }

  const offsetBottom = chartHeight - markerY;

  if (offsetBottom < tooltipHeightHalf) {
    return markerY - (tooltipHeightHalf - offsetBottom);
  }

  return markerY;
};
