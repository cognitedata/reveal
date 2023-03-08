import get from 'lodash/get';
import { PlotMouseEvent } from 'plotly.js';
import { getMarkerPosition } from './getMarkerPosition';

const TOOLTIP_HORIZONTAL_MARGIN = 16;

export const getTooltipPosition = (
  chartRef: React.RefObject<HTMLDivElement>,
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

  const plot = chartRef.current?.getElementsByClassName('js-plotly-plot')[0];
  const plotOffsetTop = get(plot, 'offsetTop', 0);

  const grid = plot?.getElementsByClassName('nsewdrag drag')[0];
  const gridStyle = grid && window.getComputedStyle(grid);
  const gridHeight = gridStyle
    ? parseInt(gridStyle.getPropertyValue('height'))
    : 0;

  const { x = 0, y = 0 } = getMarkerPosition(plotMouseEvent);

  return {
    x: calculateTooltipPositionX(x, tooltipWidth, chartWidth),
    y: calculateTooltipPositionY(y, tooltipHeight, plotOffsetTop, gridHeight),
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
  plotOffsetTop: number,
  gridHeight: number
) => {
  const tooltipHeightHalf = tooltipHeight / 2;
  const referenceMin = plotOffsetTop + tooltipHeightHalf;
  const referenceMax = plotOffsetTop + gridHeight;

  if (markerY < referenceMin) {
    return referenceMin;
  }

  const offsetBottom = referenceMax - markerY;

  if (offsetBottom < tooltipHeightHalf) {
    return markerY - (tooltipHeightHalf - offsetBottom);
  }

  return markerY;
};
