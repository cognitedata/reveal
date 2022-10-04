import { HoleSectionGroupInternal } from 'domain/wells/holeSections/internal/types';

import { HoleSectionView } from '../types';

export const adaptToHoleSectionDataView = (
  holeSectionGroups: HoleSectionGroupInternal[]
): HoleSectionView[] => {
  return holeSectionGroups.flatMap(({ wellboreMatchingId, sections }) => {
    return sections.map((section) => {
      return {
        ...section,
        wellboreMatchingId,
      };
    });
  });
};
