import { useState } from 'react';

import isUndefined from 'lodash/isUndefined';

import { LineChartProps } from '../types';
import { calculateAxisTickCount } from '../utils/calculateAxisTickCount';

export const useAxisTickCount = ({
  xAxis,
  yAxis,
}: Pick<LineChartProps, 'xAxis' | 'yAxis'>) => {
  const [xAxisTickCount, setXAxisTickCount] = useState<number>();
  const [yAxisTickCount, setYAxisTickCount] = useState<number>();

  const updateAxisTickCount = (graph: HTMLElement | null) => {
    if (!graph) {
      return;
    }

    const xAxisTickCountProp = xAxis?.tickCount;
    const yAxisTickCountProp = yAxis?.tickCount;

    const { nticksX, nticksY } = calculateAxisTickCount(graph);

    setXAxisTickCount(
      isUndefined(xAxisTickCountProp) ? nticksX : xAxisTickCountProp
    );

    setYAxisTickCount(
      isUndefined(yAxisTickCountProp) ? nticksY : yAxisTickCountProp
    );
  };

  return {
    xAxisTickCount,
    yAxisTickCount,
    updateAxisTickCount,
  };
};
