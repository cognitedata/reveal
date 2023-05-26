import { useEffect, useState } from 'react';

import isEqual from 'lodash/isEqual';

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
   * This side-effect should be executed only when,
   * signal is `true` AND `plotDataRange` is changed.
   * That's why the deep equality is checked below.
   */
  useDeepEffect(() => {
    if (signal && plotDataRange && !isEqual(initialRange, plotDataRange)) {
      setInitialRange(plotDataRange);
      setSignal(false);
    }
  }, [signal, plotDataRange]);

  return initialRange;
};
