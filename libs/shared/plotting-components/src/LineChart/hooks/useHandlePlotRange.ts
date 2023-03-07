import { useCallback, useState } from 'react';

import isEqual from 'lodash/isEqual';
import isUndefined from 'lodash/isUndefined';

import { PlotRange } from '../types';

export const useHandlePlotRange = () => {
  const [range, setRange] = useState<PlotRange>({
    x: undefined,
    y: undefined,
  });

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
    setRange({
      x: undefined,
      y: undefined,
    });
  }, []);

  return {
    range,
    setPlotRange,
    resetPlotRange,
  };
};
