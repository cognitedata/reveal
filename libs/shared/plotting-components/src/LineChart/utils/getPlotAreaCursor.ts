import { AxisDirection } from '../types';

export const getPlotAreaCursor = (axisDirection?: AxisDirection) => {
  if (axisDirection === 'x') {
    return 'e-resize';
  }

  if (axisDirection === 'y') {
    return 'n-resize';
  }

  return 'auto';
};
