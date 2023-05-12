import { PlotRange } from '../types';

export const getPlotRangeWithMargin = (plotRange: PlotRange): PlotRange => {
  const {
    x: [xMin, xMax],
    y: [yMin, yMax],
  } = plotRange;

  const marginX = (xMax - xMin) * 0.015;
  const marginY = (yMax - yMin) * 0.055;

  return {
    x: [xMin - marginX, xMax + marginX],
    y: [yMin - marginY, yMax + marginY],
  };
};
