import { useMemo } from 'react';

import { Data, Variant } from '../types';
import { adaptToPlotlyPlotData } from '../utils/adaptToPlotlyPlotData';
import { checkIsEmptyData } from '../utils/checkIsEmptyData';

export interface Props {
  data: Data | Data[];
  showMarkers: boolean;
  variant?: Variant;
}

export const usePlotData = ({ data, showMarkers, variant }: Props) => {
  const plotData = useMemo(() => {
    return adaptToPlotlyPlotData(data, showMarkers, variant);
  }, [data, showMarkers, variant]);

  const isEmptyData = useMemo(() => {
    return checkIsEmptyData(data);
  }, [data]);

  return { plotData, isEmptyData };
};
