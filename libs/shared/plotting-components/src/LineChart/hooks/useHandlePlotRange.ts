import { useCallback, useEffect, useState } from 'react';

import isUndefined from 'lodash/isUndefined';

import { PlotRange } from '../types';

interface Props {
  initialRange?: PlotRange;
  onRangeChange?: (range: PlotRange) => void;
}

export const useHandlePlotRange = ({ initialRange, onRangeChange }: Props) => {
  const [range, setRange] = useState<PlotRange | undefined>(initialRange);

  const setPlotRange = useCallback((newRange: Partial<PlotRange>) => {
    if (isUndefined(newRange.x) || isUndefined(newRange.y)) {
      return;
    }

    setRange(newRange as PlotRange);
    onRangeChange?.(newRange as PlotRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetPlotRange = useCallback(() => {
    if (initialRange) {
      const initialRangeClone = {
        x: [...initialRange.x],
        y: [...initialRange.y],
      } as PlotRange;

      setRange(initialRangeClone);
      onRangeChange?.(initialRangeClone);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
