import { sortObjectsAscending, sortObjectsDecending } from 'utils/sort';

import { NdsInternal } from '../types';

type NdsType = Pick<NdsInternal, 'holeTop'>;

const HOLE_TOP_VALUE_ACCESSOR = 'holeTop.value';

export const sortNdsByHoleStart = <T extends NdsType>(
  nds: T[],
  desc = false
) => {
  if (desc) {
    return sortObjectsDecending<NdsType>(nds, HOLE_TOP_VALUE_ACCESSOR) as T[];
  }

  return sortObjectsAscending<NdsType>(nds, HOLE_TOP_VALUE_ACCESSOR) as T[];
};
