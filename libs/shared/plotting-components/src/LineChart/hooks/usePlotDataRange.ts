import { Data, PlotRange } from '../types';
import { getPlotRange } from '../utils/getPlotRange';
import { getPlotRangeWithMargin } from '../utils/getPlotRangeWithMargin';
import { isValidPlotRange } from '../utils/isValidPlotRange';

import { useDeepMemo } from './useDeep';

interface Props {
  data: Data | Data[];
}

export const usePlotDataRange = ({ data }: Props): PlotRange | undefined => {
  const plotRange = useDeepMemo(() => {
    return getPlotRange(data);
  }, [data]);

  return useDeepMemo(() => {
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
