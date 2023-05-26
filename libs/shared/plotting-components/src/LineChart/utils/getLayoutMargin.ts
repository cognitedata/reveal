import isEmpty from 'lodash/isEmpty';
import { Layout as PlotlyLayout } from 'plotly.js';

import { DEFAULT_MARGIN } from '../constants';
import { Axis, Layout } from '../types';

import { getMarginBottom } from './getMarginBottom';
import { getMarginLeft } from './getMarginLeft';

export interface Props {
  graph: HTMLElement | null;
  layout: Layout;
  xAxis?: Axis;
  yAxis?: Axis;
}

export const getLayoutMargin = ({
  graph,
  layout,
  xAxis,
  yAxis,
}: Props): PlotlyLayout['margin'] => {
  return {
    t: DEFAULT_MARGIN,
    r: DEFAULT_MARGIN,
    l: getMarginLeft(layout, graph, !isEmpty(yAxis?.name)),
    b: getMarginBottom(layout, graph, !isEmpty(xAxis?.name)),
  };
};
