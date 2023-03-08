import { Layout as PlotlyLayout } from 'plotly.js';

import { DEFAULT_MARGIN } from '../constants';
import { Layout } from '../types';
import { getMarginBottom } from './getMarginBottom';
import { getMarginLeft } from './getMarginLeft';

export const getLayoutMargin = (
  layout: Layout,
  graph: HTMLElement | null
): PlotlyLayout['margin'] => {
  return {
    t: DEFAULT_MARGIN,
    r: DEFAULT_MARGIN,
    l: getMarginLeft(layout, graph),
    b: getMarginBottom(layout),
  };
};
