import { filterByMinMax } from 'utils/filter/filterByMinMax';

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
    return topMeasuredDepth && filterByMinMax(topMeasuredDepth, min, max);
  });
};
