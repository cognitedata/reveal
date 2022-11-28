import { filterByMinMax } from 'utils/filter/filterByMinMax';

import { NdsInternalWithTvd } from '../types';

type NdsType = Pick<NdsInternalWithTvd, 'holeTopTvd'>;

export const filterNdsByTVD = <T extends NdsType>(
  nds: T[],
  {
    min,
    max,
  }: {
    min?: number;
    max?: number;
  }
) => {
  return nds.filter(({ holeTopTvd }) => {
    return holeTopTvd && filterByMinMax(holeTopTvd.value, min, max);
  });
};
