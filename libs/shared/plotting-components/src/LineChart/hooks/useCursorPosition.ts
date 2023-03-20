import * as React from 'react';
import { useEffect, useState } from 'react';

import { Coordinate } from '../types';
import { createEventListener } from '../utils/createEventListener';

import { checkIsCursorOnPlot } from '../utils/checkIsCursorOnPlot';
import { getCursorPosition } from '../utils/getCursorPosition';

export const useCursorPosition = (
  chartRef: React.RefObject<HTMLDivElement>
) => {
  const [cursorPosition, setCursorPosition] = useState<Coordinate>();
  const [isCursorOnPlot, setCursorOnPlot] = useState(false);

  useEffect(() => {
    return createEventListener<MouseEvent>(
      chartRef.current,
      'mousemove',
      (event) => {
        const cursorPosition = getCursorPosition(chartRef, event);
        setCursorPosition(cursorPosition);

        const isCursorOnPlot = checkIsCursorOnPlot(chartRef, event);
        setCursorOnPlot(isCursorOnPlot);
      }
    );
  }, [chartRef]);

  useEffect(() => {
    return createEventListener<MouseEvent>(
      chartRef.current,
      'mouseleave',
      (event) => {
        const isCursorOnPlot = checkIsCursorOnPlot(chartRef, event);
        setCursorOnPlot(isCursorOnPlot);
      }
    );
  }, [chartRef]);

  return { cursorPosition, isCursorOnPlot };
};
