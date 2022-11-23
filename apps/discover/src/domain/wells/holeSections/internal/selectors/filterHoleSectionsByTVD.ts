import isUndefined from 'lodash/isUndefined';

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
    if (isUndefined(topTrueVerticalDepth)) {
      return false;
    }
    if (!isUndefined(min) && !isUndefined(max)) {
      return min <= topTrueVerticalDepth && topTrueVerticalDepth <= max;
    }
    if (!isUndefined(min)) {
      return min <= topTrueVerticalDepth;
    }
    if (!isUndefined(max)) {
      return topTrueVerticalDepth <= max;
    }
    return false;
  });
};
