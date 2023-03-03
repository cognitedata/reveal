import { useMemo } from 'react';

import { Axis } from 'plotly.js';

import { Data } from '../types';
import { getRangeMode } from '../utils/getRangeMode';

export const useAxisRangeMode = (
  data: Data | Data[]
): Record<string, Axis['rangemode']> => {
  const xAxisRangeMode = useMemo(() => getRangeMode(data, 'x'), [data]);
  const yAxisRangeMode = useMemo(() => getRangeMode(data, 'y'), [data]);

  return {
    xAxisRangeMode,
    yAxisRangeMode,
  };
};
