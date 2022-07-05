import get from 'lodash/get';
import { DataTitle, PlotMouseEvent } from 'plotly.js';
import { DeepPartial } from 'redux';
import { sortByNumberAscending } from 'utils/sort/sortByNumber';

const DEFAULT_WIDTH = 342;

export const getChartDisplayValues = (data?: DeepPartial<PlotMouseEvent>) => {
  const pointData =
    data && data.points && data.points.length > 0 ? data?.points[0] : null;
  return {
    x: pointData?.x,
    y: pointData?.y,
    yTitle: (pointData?.yaxis?.title as DataTitle)?.text,
    xTitle: (pointData?.xaxis?.title as DataTitle)?.text,
    customdata: pointData?.data?.customdata || [],
    line: pointData?.data?.line,
    marker: pointData?.data?.marker,
  };
};

export const getChartPositionValues = (data?: DeepPartial<PlotMouseEvent>) => {
  let left = data?.event?.offsetX || 0;
  const top = data?.event?.offsetY || 0;
  const chartWidth = get(data, 'event.target.viewportElement.clientWidth', 0);
  if (data && data.event && chartWidth - left < DEFAULT_WIDTH) {
    left -= DEFAULT_WIDTH;
  }
  return { left, top: top + 10, show: !!data, width: DEFAULT_WIDTH };
};

export const findVisibleYTicksValues = (graph: HTMLElement) => {
  // Get the y-axis ticks element label from the graph "DOM" and return them in an array
  const yTickLabelElements = Array.from(graph.getElementsByClassName('ytick'));

  const ticks = yTickLabelElements.map((labelElement) => {
    // Plotly is using a '-' char which is not parseable for the "Number" function
    return Number(labelElement.textContent?.replace('−', '-'));
  });

  const sortedTicks = sortByNumberAscending(ticks);

  return sortedTicks;
};

export const calculateYTicksGap = (graph: HTMLElement) => {
  // Get all the y-axis ticks element lines draw in the graph "DOM" and return them in an array
  const yTickLineElements = Array.from(
    graph.getElementsByClassName('ygrid crisp')
  );
  const zeroLineElement = Array.from(
    graph.getElementsByClassName('yzl zl crisp')
  );

  const lines = [...yTickLineElements, ...zeroLineElement].map(
    (lineElement) => {
      const { f } = new DOMMatrixReadOnly(
        window.getComputedStyle(lineElement).getPropertyValue('transform')
      );

      return f;
    }
  );

  const sortedLines = sortByNumberAscending(lines);

  // Using second and third line, as I suspect the first line are outside the plotly grid (thus, not giving valid values) in calculations
  const [firstLine, secondLine] = sortedLines;
  return secondLine - firstLine;
};
