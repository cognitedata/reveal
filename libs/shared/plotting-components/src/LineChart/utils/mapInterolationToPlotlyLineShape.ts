import { ScatterLine } from 'plotly.js';

import { Interpolation } from '../types';

export const mapInterolationToPlotlyLineShape = (
  interpolation?: Interpolation
): ScatterLine['shape'] | undefined => {
  switch (interpolation) {
    case 'linear':
      return 'linear';

    case 'spline':
      return 'spline';

    case 'step':
      return 'hv';

    default:
      return undefined;
  }
};
