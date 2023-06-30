import { useState } from 'react';

import { PlotRange } from '../types';
import { getUnifiedPlotRange } from '../utils/getUnifiedPlotRange';
import { isUndefinedPlotRange } from '../utils/isUndefinedPlotRange';

import { useDeepCallback, useDeepEffect } from './useDeep';

interface Props {
  initialRange?: PlotRange;
  plotDataRange?: PlotRange;
  onRangeChange?: (range: PlotRange) => void;
}

export const useHandlePlotRange = ({
  initialRange,
  plotDataRange,
  onRangeChange,
}: Props) => {
  const [range, setRange] = useState<PlotRange>();
  const [enableAutoAlign, setEnableAutoAlign] = useState<boolean>(true);

  useDeepEffect(() => {
    if (initialRange) {
      setRange(initialRange);
    }
  }, [initialRange]);

  /**
   * To ensure all the datapoints are shown in the plot area.
   * This alignment is done only if @enableAutoAlign is true.
   */
  useDeepEffect(() => {
    if (enableAutoAlign && plotDataRange && range) {
      const unifiedPlotRange = getUnifiedPlotRange(plotDataRange, range);
      setRange(unifiedPlotRange);
    }
  }, [plotDataRange]);

  const setPlotRange = useDeepCallback(
    (changedRange: Partial<PlotRange>, allowAutoAlign = true) => {
      if (isUndefinedPlotRange(changedRange) || !range) {
        return;
      }

      const newRange = {
        x: changedRange.x || range.x,
        y: changedRange.y || range.y,
      };

      setRange(newRange);
      onRangeChange?.(newRange);
      setEnableAutoAlign(allowAutoAlign);
    },
    [range]
  );

  const resetPlotRange = useDeepCallback(() => {
    if (initialRange) {
      setRange(initialRange);
      onRangeChange?.(initialRange);
    }
  }, [initialRange]);

  return {
    range,
    setPlotRange,
    resetPlotRange,
  };
};
