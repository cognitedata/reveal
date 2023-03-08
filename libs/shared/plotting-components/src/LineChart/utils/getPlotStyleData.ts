import get from 'lodash/get';

export const getPlotStyleData = (graph: HTMLElement | null) => {
  const plot = graph?.getElementsByClassName('js-plotly-plot')[0];
  const plotOffsetTop = get(plot, 'offsetTop', 0);

  const grid = plot?.getElementsByClassName('nsewdrag drag')[0];
  const gridStyle = grid && window.getComputedStyle(grid);
  const gridHeight = gridStyle
    ? parseInt(gridStyle.getPropertyValue('height'))
    : 0;

  return {
    plotOffsetTop,
    gridHeight,
  };
};
