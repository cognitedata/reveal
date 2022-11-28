import { filterByMinMax } from 'utils/filter/filterByMinMax';

import { HoleSectionInternalWithTvd } from '../types';

type HoleSectionType = Pick<HoleSectionInternalWithTvd, 'topTrueVerticalDepth'>;

export const filterHoleSectionsByTVD = <T extends HoleSectionType>(
  holeSections: T[],
  {
    min,
    max,
  }: {
    min?: number;
    max?: number;
  }
) => {
  return holeSections.filter(({ topTrueVerticalDepth }) => {
    return (
      topTrueVerticalDepth && filterByMinMax(topTrueVerticalDepth, min, max)
    );
  });
};
