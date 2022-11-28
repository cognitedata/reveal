import { filterByMinMax } from 'utils/filter/filterByMinMax';

import { NptInternal } from '../types';

type NptType = Pick<NptInternal, 'measuredDepth'>;

export const filterNptByMD = <T extends NptType>(
  npt: T[],
  {
    min,
    max,
  }: {
    min?: number;
    max?: number;
  }
) => {
  return npt.filter(({ measuredDepth }) => {
    return measuredDepth && filterByMinMax(measuredDepth.value, min, max);
  });
};
