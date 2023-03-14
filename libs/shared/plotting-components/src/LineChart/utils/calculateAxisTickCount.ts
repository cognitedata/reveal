import get from 'lodash/get';
import head from 'lodash/head';

import { getAverageTickTextWidth } from './getAverageTickTextWidth';

export const calculateAxisTickCount = (graph: HTMLElement) => {
  const plot = head(graph.getElementsByClassName('plot'));
  const plotWidth = get(plot, 'viewportElement.clientWidth', 0);
  const plotHeight = get(plot, 'viewportElement.clientHeight', 0);

  const xticks = graph.getElementsByClassName('xtick');
  const xTickWidth = getAverageTickTextWidth(xticks);

  const nticksX = Math.ceil(plotWidth / xTickWidth / 2);

  const xTicksGap = plotWidth / nticksX;
  const nticksY = Math.ceil(plotHeight / xTicksGap);

  return { nticksX, nticksY };
};
