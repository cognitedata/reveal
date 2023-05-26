import { PlotMouseEvent } from 'plotly.js';

import { Coordinate } from '../types';

import { getMarkerPosition } from './getMarkerPosition';
import { getPlotStyleData } from './getPlotStyleData';

const TOOLTIP_HORIZONTAL_MARGIN = 16;

export const getTooltipPosition = (
  chartRef: React.RefObject<HTMLDivElement>,
  plotMouseEvent?: PlotMouseEvent,
  tooltipWidth?: number,
  tooltipHeight?: number,
  referencePosition: Coordinate = {}
) => {
  if (!plotMouseEvent || !tooltipWidth || !tooltipHeight) {
    return {
      x: 0,
      y: 0,
    };
  }

  const { offsetTop, height, width } = getPlotStyleData(chartRef.current);

  const { x = 0, y = 0 } = {
    ...getMarkerPosition(plotMouseEvent),
    ...referencePosition,
  };

  return {
    x: calculateTooltipPositionX(x, tooltipWidth, width),
    y: calculateTooltipPositionY(y, tooltipHeight, offsetTop, height),
  };
};

export const calculateTooltipPositionX = (
  markerX: number,
  tooltipWidth: number,
  gridWidth: number
) => {
  const x = markerX + TOOLTIP_HORIZONTAL_MARGIN;

  if (gridWidth - x < tooltipWidth) {
    return markerX - tooltipWidth - TOOLTIP_HORIZONTAL_MARGIN;
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
    const position = markerY - (tooltipHeightHalf - offsetBottom);
    return Math.max(position, referenceMin);
  }

  return markerY;
};
