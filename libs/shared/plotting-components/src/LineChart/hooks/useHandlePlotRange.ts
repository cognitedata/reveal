import { useCallback, useEffect, useState } from 'react';

import isUndefined from 'lodash/isUndefined';

import { PlotRange } from '../types';

export const useHandlePlotRange = (initialRange: Required<PlotRange>) => {
  const [range, setRange] = useState<PlotRange>(initialRange);

  const setPlotRange = useCallback((newRange: PlotRange) => {
    if (isUndefined(newRange.x) || isUndefined(newRange.y)) {
      return;
    }
    setRange(newRange);
  }, []);

  const resetPlotRange = useCallback(() => {
    setRange({
      x: [...initialRange.x],
      y: [...initialRange.y],
    });
  }, [initialRange]);

  useEffect(() => {
    resetPlotRange();
  }, [resetPlotRange]);

  return {
    range,
    setPlotRange,
    resetPlotRange,
  };
};
