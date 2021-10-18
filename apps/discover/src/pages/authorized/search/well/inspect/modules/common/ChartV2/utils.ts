import { DataTitle, PlotMouseEvent } from 'plotly.js';
import { DeepPartial } from 'redux';

const DEFAULT_WIDTH = 342;

export const getChartDisplayValues = (data?: DeepPartial<PlotMouseEvent>) => {
  const pointData =
    data && data.points && data.points.length > 0 ? data?.points[0] : null;
  return {
    x: pointData?.x,
    y: pointData?.y,
    yTitle: (pointData?.yaxis?.title as DataTitle)?.text,
    xTitle: (pointData?.xaxis?.title as DataTitle)?.text,
    customdata: pointData?.data?.customdata || [],
    line: pointData?.data?.line,
    marker: pointData?.data?.marker,
  };
};

export const getChartPositionValues = (data?: DeepPartial<PlotMouseEvent>) => {
  let left = data?.event?.offsetX || 0;
  const top = data?.event?.offsetY;
  if (
    data &&
    data.event &&
    (data.event.view?.innerWidth || 0) - (data.event.x || 0) < DEFAULT_WIDTH
  ) {
    left -= DEFAULT_WIDTH;
  }
  return { left, top, show: !!data, width: DEFAULT_WIDTH };
};
