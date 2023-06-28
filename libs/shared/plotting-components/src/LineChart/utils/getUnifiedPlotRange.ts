import { PlotRange } from '../types';

import { getUnifiedAxisRange } from './getUnifiedAxisRange';

export const getUnifiedPlotRange = (
  plotRange1: PlotRange,
  plotRange2: PlotRange
): PlotRange => {
  return {
    x: getUnifiedAxisRange(plotRange1.x, plotRange2.x),
    y: getUnifiedAxisRange(plotRange1.y, plotRange2.y),
  };
};
