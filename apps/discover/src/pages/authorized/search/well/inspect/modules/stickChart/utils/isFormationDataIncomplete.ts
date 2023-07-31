import isEqual from 'lodash/isEqual';

import { WellTopSurfaceView } from '../types';

export const isFormationDataIncomplete = (data: WellTopSurfaceView[]) => {
  return data.every(({ top, base }) => isEqual(top, base));
};
