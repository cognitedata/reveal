import { useState } from 'react';

import isUndefined from 'lodash/isUndefined';

import { calculateAxisTickCount } from '../utils/calculateAxisTickCount';

type TickCount = {
  x?: number;
  y?: number;
};

const INITIAL_TICK_COUNT: TickCount = {
  x: 0,
  y: 0,
};

export const useAxisTickCount = (props: TickCount) => {
  const [tickCount, setTickCount] = useState<TickCount>(INITIAL_TICK_COUNT);

  const updateAxisTickCount = (
    graph: HTMLElement | null,
    isEmptyData?: boolean
  ) => {
    if (!graph || isEmptyData) {
      setTickCount(INITIAL_TICK_COUNT);
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
