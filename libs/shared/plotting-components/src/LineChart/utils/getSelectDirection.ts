import { Layout as PlotlyLayout } from 'plotly.js';

import { AxisDirection } from '../types';

export const getSelectDirection = (
  axisDirection: AxisDirection | undefined
): PlotlyLayout['selectdirection'] | undefined => {
  if (axisDirection === 'x') {
    return 'h';
  }

  if (axisDirection === 'y') {
    return 'v';
  }

  if (axisDirection === 'x+y') {
    return 'd';
  }

  return undefined;
};
