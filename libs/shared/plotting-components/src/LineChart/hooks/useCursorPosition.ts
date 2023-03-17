import * as React from 'react';
import { useEffect, useState } from 'react';

import get from 'lodash/get';

import { Coordinate } from '../types';
import { createEventListener } from '../utils/createEventListener';
import head from 'lodash/head';
import { checkIsClientOnElementt } from '../utils/checkIsClientOnElementt';
import { PLOT_CLASSNAME } from '../constants';

export const useCursorPosition = (
  chartRef: React.RefObject<HTMLDivElement>
) => {
  const [cursorPosition, setCursorPosition] = useState<Coordinate>();
  const [isCursorOnPlot, setCursorOnPlot] = useState(false);

  useEffect(() => {
    createEventListener(chartRef.current, 'mousemove', (event) => {
      const chartBounds = chartRef.current?.getBoundingClientRect();

      const plotBounds = head(
        chartRef.current?.getElementsByClassName(PLOT_CLASSNAME)
      )?.getBoundingClientRect();

      if (!chartBounds) {
        return;
      }

      const clientX = get(event, 'clientX', 0);
      const clientY = get(event, 'clientY', 0);

      const x = clientX - chartBounds.left;
      const y = clientY - chartBounds.top;

      setCursorPosition({ x, y });

      const isCursorOnPlot = checkIsClientOnElementt(
        { x: clientX, y: clientY },
        plotBounds
      );
      setCursorOnPlot(isCursorOnPlot);
    });

    createEventListener(chartRef.current, 'mouseleave', () => {
      setCursorOnPlot(false);
    });
  }, [chartRef]);

  return { cursorPosition, isCursorOnPlot };
};
