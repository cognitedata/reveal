import { Row } from 'react-table';

import { Well } from '../types';

type WellWaterDepth = Pick<Well, 'waterDepth'>;

export const getWaterDepthSort = <T extends WellWaterDepth>(
  wellA: Row<T>,
  wellB: Row<T>
) => {
  if (!wellA.original?.waterDepth?.value) {
    return 1;
  }

  if (!wellB.original?.waterDepth?.value) {
    return -1;
  }

  return wellB.original.waterDepth.value - wellA.original.waterDepth.value;
};
