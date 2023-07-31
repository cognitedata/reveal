import { Row } from 'react-table';

import { WellInternal } from '../types';

type WellWaterDepth = Pick<WellInternal, 'waterDepth'>;

export const getWaterDepthSort = <T extends WellWaterDepth>(
  wellA: T,
  wellB: T
) => {
  if (!wellA.waterDepth?.value) {
    return -1;
  }

  if (!wellB.waterDepth?.value) {
    return 1;
  }

  return wellA.waterDepth.value - wellB.waterDepth.value;
};

export const getWaterDepthTableSort = <T extends WellWaterDepth>(
  wellA: Row<T>,
  wellB: Row<T>
) => {
  return getWaterDepthSort(wellA.original, wellB.original);
};
