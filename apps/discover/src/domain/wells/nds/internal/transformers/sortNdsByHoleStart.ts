import { sortObjectsAscending, sortObjectsDecending } from 'utils/sort';

import { NdsInternal } from '../types';

type NdsType = Pick<NdsInternal, 'holeStart'>;

const HOLE_START_VALUE_ACCESSOR = 'holeStart.value';

export const sortNdsByHoleStart = <T extends NdsType>(
  nds: T[],
  desc = false
) => {
  if (desc) {
    return sortObjectsDecending<NdsType>(nds, HOLE_START_VALUE_ACCESSOR) as T[];
  }

  return sortObjectsAscending<NdsType>(nds, HOLE_START_VALUE_ACCESSOR) as T[];
};
