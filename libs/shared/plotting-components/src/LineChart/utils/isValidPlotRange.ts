import { PlotRange } from '../types';

import { isUndefinedPlotRange } from './isUndefinedPlotRange';

export const isValidPlotRange = (range: Partial<PlotRange>) => {
  if (isUndefinedPlotRange(range)) {
    return false;
  }

  const values = [...(range.x || []), ...(range.y || [])];

  if (values.some((value) => value === Infinity || value === -Infinity)) {
    return false;
  }

  return true;
};
