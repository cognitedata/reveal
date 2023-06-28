import { useEffect, useState } from 'react';

import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import isUndefined from 'lodash/isUndefined';

import { PlotRange, PresetPlotRange } from '../types';
import { convertToPlotRange } from '../utils/convertToPlotRange';

import { useDeepEffect, useDeepMemo } from './useDeep';

interface Props {
  plotDataRange?: PlotRange;
  dataRevision?: number | string;
  presetRange?: PresetPlotRange;
}

/**
 * This hook keeps track of the plot initial range.
 *
 * If @dataRevision is not defined, the initial range is synced with @plotDataRange .
 *
 * If @dataRevision is defined, the initial range is taken from the first load just after @dataRevision is changed.
 * This is useful when fetching datapoints on change range.
 * We can keep @initialRange unchanged when @plotDataRange is changed.
 *
 * @initialRange can be updated only if @signal is @true .
 * When @dataRevision is not defined, @signal is always @true ,
 * allowing @initialRange to be updated as soon as @plotDataRange is updated.
 *
 * When @dataRevision is defined and changed, @signal is set to @true .
 * Then @signal is set back to @false when the @initialRange is updated.
 * This is useful when we have to wait for data to fetch after @dataRevision is changed.
 *
 * If @presetRange is defined, the @initialRange is overwritten by the values of @presetRange
 * AT THE TIME WHICH @initialRange is changed.
 *
 *
 * IMPORTANT NOTICE:
 * Plotly mutates the range values by REFERENCE.
 * So, we have to clone the values to avoid @initialRange being mutated when changing the plot range.
 * PLEASE DON'T REMOVE ANY CLONING STEPS HERE.
 * PLEASE BE CAREFUL IF YOU CHANGE ANYTHING IN THIS HOOK.
 */
export const usePlotDataRangeInitial = ({
  plotDataRange,
  dataRevision,
  presetRange,
}: Props) => {
  const [signal, setSignal] = useState<boolean>(true);
  const [initialRange, setInitialRange] = useState<PlotRange>();

  useEffect(() => {
    setSignal(true);
  }, [dataRevision]);

  useDeepEffect(() => {
    /**
     * Update @initialRange when @signal is @true and @plotDataRange is changed.
     */
    if (signal && plotDataRange && !isEqual(plotDataRange, initialRange)) {
      setInitialRange(cloneDeep(plotDataRange));
      setSignal(isUndefined(dataRevision));
    }
  }, [signal, plotDataRange]);

  return useDeepMemo(() => {
    const presetRangeClone = cloneDeep(presetRange);

    if (initialRange) {
      return convertToPlotRange({
        x: presetRangeClone?.x || initialRange.x,
        y: presetRangeClone?.y || initialRange.y,
      });
    }

    return undefined;
  }, [initialRange]);
};
