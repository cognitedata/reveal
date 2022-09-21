import { HoleSectionGroup } from '@cognite/sdk-wells';

import { UserPreferredUnit } from 'constants/units';

import { HoleSectionGroupInternal } from '../types';

import { normalizeHoleSections } from './normalizeHoleSections';

export const normalizeHoleSectionGroups = (
  holeSectionGroups: HoleSectionGroup[],
  userPreferredUnit: UserPreferredUnit
): HoleSectionGroupInternal[] => {
  return holeSectionGroups.map((holeSectionGroup) => {
    const { measuredDepthUnit } = holeSectionGroup;

    return {
      ...holeSectionGroup,
      measuredDepthUnit: userPreferredUnit,
      sizeUnit: userPreferredUnit,
      sections: normalizeHoleSections(
        holeSectionGroup.sections,
        measuredDepthUnit,
        userPreferredUnit
      ),
    };
  });
};
