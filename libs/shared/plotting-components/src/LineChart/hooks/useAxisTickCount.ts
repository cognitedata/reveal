import { useState } from 'react';

import isUndefined from 'lodash/isUndefined';

import { calculateAxisTickCount } from '../utils/calculateAxisTickCount';

type TickCount = {
  x?: number;
  y?: number;
};

export const useAxisTickCount = (props: TickCount) => {
  const [tickCount, setTickCount] = useState<TickCount>({
    x: 0,
    y: 0,
  });

  const updateAxisTickCount = (
    graph: HTMLElement | null,
    isEmptyData?: boolean
  ) => {
    if (!graph || isEmptyData) {
      setTickCount({
        x: 0,
        y: 0,
      });
      return;
    }

    const xAxisTickCountProp = props.x;
    const yAxisTickCountProp = props.y;

    const { nticksX, nticksY } = calculateAxisTickCount(graph);

    setTickCount({
      x: isUndefined(xAxisTickCountProp) ? nticksX : xAxisTickCountProp,
      y: isUndefined(yAxisTickCountProp) ? nticksY : yAxisTickCountProp,
    });
  };

  return {
    tickCount,
    updateAxisTickCount,
  };
};
