import isUndefined from 'lodash/isUndefined';

import { HoleSectionInternal } from '../types';

type HoleSectionType = Pick<HoleSectionInternal, 'topMeasuredDepth'>;

export const filterHoleSectionsByMD = <T extends HoleSectionType>(
  holeSections: T[],
  {
    min,
    max,
  }: {
    min?: number;
    max?: number;
  }
) => {
  return holeSections.filter(({ topMeasuredDepth }) => {
    if (isUndefined(topMeasuredDepth)) {
      return false;
    }
    if (!isUndefined(min) && !isUndefined(max)) {
      return min <= topMeasuredDepth && topMeasuredDepth <= max;
    }
    if (!isUndefined(min)) {
      return min <= topMeasuredDepth;
    }
    if (!isUndefined(max)) {
      return topMeasuredDepth <= max;
    }
    return false;
  });
};
