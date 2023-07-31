import { filterByMinMax } from 'utils/filter/filterByMinMax';

import { NptInternalWithTvd } from '../types';

type NptType = Pick<NptInternalWithTvd, 'trueVerticalDepth'>;

export const filterNptByTVD = <T extends NptType>(
  npt: T[],
  {
    min,
    max,
  }: {
    min?: number;
    max?: number;
  }
) => {
  return npt.filter(({ trueVerticalDepth }) => {
    return (
      trueVerticalDepth && filterByMinMax(trueVerticalDepth.value, min, max)
    );
  });
};
