import isUndefined from 'lodash/isUndefined';
import { useState } from 'react';

import { AxisRange } from '../types';

type Range = {
  x?: AxisRange;
  y?: AxisRange;
};

export const useHandlePlotRange = () => {
  const [range, setRange] = useState<Range>({
    x: undefined,
    y: undefined,
  });

  const setPlotRange = (newRange: Range) => {
    if (
      isUndefined(newRange.x) ||
      isUndefined(newRange.y) ||
      range.x === newRange.x ||
      range.y === newRange.y
    ) {
      return;
    }

    setRange(newRange);
  };

  const resetPlotRange = () => {
    setRange({
      x: undefined,
      y: undefined,
    });
  };

  return {
    range,
    setPlotRange,
    resetPlotRange,
  };
};
