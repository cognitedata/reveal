import { PlotData } from 'plotly.js';

import { PresetPlotRange } from '../types';

export const adaptPresetRangeToPlotlyData = (
  presetRange?: PresetPlotRange
): Partial<PlotData>[] => {
  return [
    {
      ...presetRange,
      line: {
        color: 'transparent',
      },
    },
  ];
};
