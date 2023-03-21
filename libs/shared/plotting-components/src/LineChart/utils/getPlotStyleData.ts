import get from 'lodash/get';

import { PLOT_CLASSNAME } from '../constants';

export const getPlotStyleData = (graph: HTMLElement | null) => {
  const plot = graph?.getElementsByClassName('js-plotly-plot')[0];
  const offsetTop = get(plot, 'offsetTop', 0);
  const offsetLeft = get(plot, 'offsetLeft', 0);

  const grid = plot?.getElementsByClassName(PLOT_CLASSNAME)[0];
  const gridStyle = grid && window.getComputedStyle(grid);
  const height = gridStyle ? parseInt(gridStyle.getPropertyValue('height')) : 0;
  const width = gridStyle ? parseInt(gridStyle.getPropertyValue('width')) : 0;

  return {
    offsetTop,
    offsetLeft,
    height,
    width,
  };
};
