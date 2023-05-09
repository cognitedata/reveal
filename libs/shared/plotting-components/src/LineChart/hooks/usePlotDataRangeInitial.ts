import { useEffect, useState } from 'react';

import { Data, PlotRange } from '../types';
import { isValidPlotRange } from '../utils/isValidPlotRange';
import { usePlotDataRange } from './usePlotDataRange';

interface Props {
  data: Data | Data[];
  showMarkers: boolean;
  dataRevision?: number | string;
}

export const usePlotDataRangeInitial = ({
  data,
  showMarkers,
  dataRevision,
}: Props) => {
  const [signal, setSignal] = useState(true);
  const [initialRange, setInitialRange] = useState<PlotRange>();

  const plotRange = usePlotDataRange({
    data,
    showMarkers,
  });

  useEffect(() => {
    setSignal(true);
  }, [dataRevision]);

  const [xMin, xMax] = plotRange?.x || [0, 0];
  const [yMin, yMax] = plotRange?.y || [0, 0];

  /**
   * This side-effect should be triggered ONLY when the plot range is changed.
   * So, don't include any other dependencies.
   *
   * When the side-effect is triggered, AND `signal` is `true`,
   * it should change the state.
   */
  useEffect(() => {
    if (signal && plotRange && isValidPlotRange(plotRange)) {
      setInitialRange(plotRange);
      setSignal(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xMin, xMax, yMin, yMax]);

  return initialRange;
};
