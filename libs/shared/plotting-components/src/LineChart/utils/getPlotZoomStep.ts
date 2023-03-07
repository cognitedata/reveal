import { BUTTON_ZOOM_STEP_SIZE } from '../constants';
import { PlotRange } from '../types';

const BUTTON_ZOOM_STEP_SIZE_PERCENTAGE = BUTTON_ZOOM_STEP_SIZE / 100;

export const getPlotZoomStep = (range: PlotRange) => {
  if (!range.x || !range.y) {
    return {
      x: 0,
      y: 0,
    };
  }

  const [xMin, xMax] = range.x;
  const [yMin, yMax] = range.y;

  return {
    x: (xMax - xMin) * BUTTON_ZOOM_STEP_SIZE_PERCENTAGE,
    y: (yMax - yMin) * BUTTON_ZOOM_STEP_SIZE_PERCENTAGE,
  };
};
