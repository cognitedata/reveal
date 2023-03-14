import { PlotElement } from '../components/Plot';
import { AxisDirection, AxisRange, PlotRange } from '../types';
import { getPlotZoomStep } from './getPlotZoomStep';

export const getPlotZoomRange = (
  graph: PlotElement | null,
  zoomDirection: AxisDirection,
  mode: 'zoom-in' | 'zoom-out'
): PlotRange | undefined => {
  const range = graph?.getPlotRange();

  if (!range || !range.x || !range.y) {
    return;
  }

  const step = getPlotZoomStep(range);

  const [xMin, xMax] = range.x;
  const [yMin, yMax] = range.y;

  let stepX = step.x;
  let stepY = step.y;

  if (mode === 'zoom-out') {
    stepX *= -1;
    stepY *= -1;
  }

  const newXRange = zoomDirection.includes('x')
    ? [xMin + stepX, xMax - stepX]
    : range.x;

  const newYRange = zoomDirection.includes('y')
    ? [yMin + stepY, yMax - stepY]
    : range.y;

  return {
    x: newXRange as AxisRange,
    y: newYRange as AxisRange,
  };
};
