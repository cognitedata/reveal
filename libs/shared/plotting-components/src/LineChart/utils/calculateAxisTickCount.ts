import get from 'lodash/get';
import head from 'lodash/head';

import { PLOT_CLASSNAME } from '../constants';
import { getAverageTickTextWidth } from './getAverageTickTextWidth';

const X_AXIS_TICK_MARGIN = 32; // marginLeft + marginRight

export const calculateAxisTickCount = (graph: HTMLElement) => {
  const plot = head(graph.getElementsByClassName(PLOT_CLASSNAME));
  const plotWidth = get(plot, 'viewportElement.clientWidth', 0);
  const plotHeight = get(plot, 'viewportElement.clientHeight', 0);

  const xticks = graph.getElementsByClassName('xtick');
  const xTickWidth = getAverageTickTextWidth(xticks);
  const xTickWidthWithMargin = xTickWidth + X_AXIS_TICK_MARGIN;

  const nticksX = Math.ceil(plotWidth / xTickWidthWithMargin);

  const xTicksGap = plotWidth / nticksX;
  const nticksY = Math.ceil(plotHeight / xTicksGap);

  return { nticksX, nticksY };
};
