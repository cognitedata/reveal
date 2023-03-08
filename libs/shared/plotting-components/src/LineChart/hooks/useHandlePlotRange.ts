import { useCallback, useState } from 'react';

import isEqual from 'lodash/isEqual';
import isUndefined from 'lodash/isUndefined';

import { PlotRange } from '../types';

export const useHandlePlotRange = (initialRange: Required<PlotRange>) => {
  const [range, setRange] = useState<PlotRange>(initialRange);

  const setPlotRange = useCallback(
    (newRange: PlotRange) => {
      if (
        isUndefined(newRange.x) ||
        isUndefined(newRange.y) ||
        isEqual(range, newRange)
      ) {
        return;
      }

      setRange(newRange);
    },
    [range]
  );

  const resetPlotRange = useCallback(() => {
    setRange(initialRange);
  }, [initialRange]);

  return {
    range,
    setPlotRange,
    resetPlotRange,
  };
};
