import { PlotData, PlotDatum } from 'plotly.js';

import { HOVER_MARKER_BORDER_WIDTH, MARKER_SIZE } from '../constants';

export const getHoveredChartData = (
  initialData: Partial<PlotData>[],
  point?: PlotDatum,
  hoveredMarkerBorderColor?: string
) => {
  if (!point || !hoveredMarkerBorderColor) {
    return initialData;
  }

  const { curveNumber, pointNumber } = point;

  const curveData = initialData[curveNumber];
  const markerSizes = [...((curveData.marker?.size || []) as number[])];
  const markerLineColors = [
    ...((curveData.marker?.line?.color || []) as string[]),
  ];

  markerSizes[pointNumber] = MARKER_SIZE + HOVER_MARKER_BORDER_WIDTH;
  markerLineColors[pointNumber] = hoveredMarkerBorderColor;

  const updatedCurveData: Partial<PlotData> = {
    ...curveData,
    marker: {
      ...(curveData.marker || {}),
      size: markerSizes,
      line: {
        ...(curveData.marker?.line || {}),
        color: markerLineColors,
      },
    },
  };

  const updatedData = [...initialData];
  updatedData[curveNumber] = updatedCurveData;

  return updatedData;
};
