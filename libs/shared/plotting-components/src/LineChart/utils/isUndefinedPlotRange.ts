import isUndefined from 'lodash/isUndefined';

import { PlotRange } from '../types';

export const isUndefinedPlotRange = (range: Partial<PlotRange>) => {
  return isUndefined(range.x) && isUndefined(range.y);
};
