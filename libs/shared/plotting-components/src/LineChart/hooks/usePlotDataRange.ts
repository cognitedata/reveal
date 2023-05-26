import { useMemo } from 'react';

import { Data, PlotRange } from '../types';
import { getPlotRange } from '../utils/getPlotRange';
import { getPlotRangeWithMargin } from '../utils/getPlotRangeWithMargin';
import { isValidPlotRange } from '../utils/isValidPlotRange';

interface Props {
  data: Data | Data[];
}

export const usePlotDataRange = ({ data }: Props): PlotRange | undefined => {
  const plotRange = useMemo(() => getPlotRange(data), [data]);

  return useMemo(() => {
    if (!plotRange) {
      return undefined;
    }

    const plotRangeWithMargin = getPlotRangeWithMargin(plotRange);

    if (isValidPlotRange(plotRangeWithMargin)) {
      return plotRangeWithMargin;
    }

    return undefined;
  }, [plotRange]);
};
