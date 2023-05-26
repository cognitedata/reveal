import { useState } from 'react';

import { PlotRange } from '../types';
import { isUndefinedPlotRange } from '../utils/isUndefinedPlotRange';

import { useDeepCallback, useDeepEffect } from './useDeep';

interface Props {
  initialRange?: PlotRange;
  onRangeChange?: (range: PlotRange) => void;
}

export const useHandlePlotRange = ({ initialRange, onRangeChange }: Props) => {
  const [range, setRange] = useState<PlotRange | undefined>(initialRange);

  const setPlotRange = useDeepCallback(
    (changedRange: Partial<PlotRange>) => {
      if (isUndefinedPlotRange(changedRange) || !range) {
        return;
      }

      const newRange = {
        x: changedRange.x || range.x,
        y: changedRange.y || range.y,
      };

      setRange(newRange);
      onRangeChange?.(newRange);
    },
    [range]
  );

  const resetPlotRange = useDeepCallback(() => {
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

  useDeepEffect(() => {
    if (initialRange) {
      setRange({
        x: [...initialRange.x],
        y: [...initialRange.y],
      });
    }
  }, [initialRange]);

  return {
    range,
    setPlotRange,
    resetPlotRange,
  };
};
