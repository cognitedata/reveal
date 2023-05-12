import { useEffect, useState } from 'react';

import { PlotRange } from '../types';
import { useDeepEffect } from './useDeep';

interface Props {
  plotDataRange?: PlotRange;
  dataRevision?: number | string;
}

export const usePlotDataRangeInitial = ({
  plotDataRange,
  dataRevision,
}: Props) => {
  const [signal, setSignal] = useState(true);
  const [initialRange, setInitialRange] = useState<PlotRange>();

  useEffect(() => {
    setSignal(true);
  }, [dataRevision]);

  /**
   * This side-effect should be triggered ONLY when the plot range is changed.
   * So, don't include any other dependencies.
   *
   * When the side-effect is triggered, AND `signal` is `true`,
   * it should change the state.
   */
  useDeepEffect(() => {
    if (signal && plotDataRange) {
      setInitialRange(plotDataRange);
      setSignal(false);
    }
  }, [plotDataRange]);

  return initialRange;
};
