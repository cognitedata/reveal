import { HoleSectionGroupInternal } from 'domain/wells/holeSections/internal/types';

import { HoleSectionView } from '../types';

export const adaptToHoleSectionDataView = (
  holeSectionGroups: HoleSectionGroupInternal[]
): HoleSectionView[] => {
  return holeSectionGroups.flatMap(
    ({ wellboreMatchingId, sections, sizeUnit, measuredDepthUnit }) => {
      return sections.map((section) => {
        return {
          ...section,
          wellboreMatchingId,
          sizeUnit,
          depthUnit: measuredDepthUnit,
        };
      });
    }
  );
};
