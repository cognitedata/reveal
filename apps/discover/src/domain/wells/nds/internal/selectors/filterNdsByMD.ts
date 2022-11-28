import { filterByMinMax } from 'utils/filter/filterByMinMax';

import { NdsInternal } from '../types';

type NdsType = Pick<NdsInternal, 'holeTop'>;

export const filterNdsByMD = <T extends NdsType>(
  nds: T[],
  {
    min,
    max,
  }: {
    min?: number;
    max?: number;
  }
) => {
  return nds.filter(({ holeTop }) => {
    return holeTop && filterByMinMax(holeTop.value, min, max);
  });
};
