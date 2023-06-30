import { PlotRange, PresetPlotRange } from '../types';

import { getAxisRangeFromValues } from './getAxisRangeFromValues';

export const convertToPlotRange = (
  range?: PlotRange | PresetPlotRange
): PlotRange | undefined => {
  const xRange = getAxisRangeFromValues(range?.x?.[0], range?.x?.[1]);
  const yRange = getAxisRangeFromValues(range?.y?.[0], range?.y?.[1]);

  if (!xRange || !yRange) {
    return undefined;
  }

  return {
    x: xRange,
    y: yRange,
  };
};
