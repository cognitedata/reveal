import { RefObject } from 'react';

import head from 'lodash/head';

import { PLOT_CLASSNAME } from '../constants';
import { checkIsClientOnElementt } from './checkIsClientOnElementt';

export const checkIsCursorOnPlot = (
  chartRef: RefObject<HTMLDivElement>,
  event: MouseEvent
) => {
  const chartBounds = chartRef.current?.getBoundingClientRect();

  const plotBounds = head(
    chartRef.current?.getElementsByClassName(PLOT_CLASSNAME)
  )?.getBoundingClientRect();

  if (!chartBounds) {
    return false;
  }

  const cursorPosition = {
    x: event.clientX,
    y: event.clientY,
  };

  return checkIsClientOnElementt(cursorPosition, plotBounds);
};
