import { useMemo } from 'react';

import { Data, PresetPlotRange, Variant } from '../types';
import { adaptPresetRangeToPlotlyData } from '../utils/adaptPresetRangeToPlotlyData';
import { adaptToPlotlyPlotData } from '../utils/adaptToPlotlyPlotData';
import { checkIsEmptyData } from '../utils/checkIsEmptyData';

export interface Props {
  data: Data | Data[];
  showMarkers: boolean;
  variant?: Variant;
  presetRange?: PresetPlotRange;
}

export const usePlotData = ({
  data,
  showMarkers,
  variant,
  presetRange,
}: Props) => {
  const isEmptyData = useMemo(() => {
    return checkIsEmptyData(data);
  }, [data]);

  const plotData = useMemo(() => {
    if (isEmptyData && presetRange) {
      if (presetRange) {
        return adaptPresetRangeToPlotlyData(presetRange);
      }
      return [];
    }
    return adaptToPlotlyPlotData({ data, showMarkers, variant });
  }, [data, isEmptyData, presetRange, showMarkers, variant]);

  return { plotData, isEmptyData };
};
