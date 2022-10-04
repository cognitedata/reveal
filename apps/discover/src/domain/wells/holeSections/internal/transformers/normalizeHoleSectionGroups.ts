import { HoleSectionGroup } from '@cognite/sdk-wells';

import { UserPreferredUnit } from 'constants/units';

import { SIZE_UNIT } from '../../constants';
import { HoleSectionGroupInternal } from '../types';

import { normalizeHoleSections } from './normalizeHoleSections';

export const normalizeHoleSectionGroups = (
  holeSectionGroups: HoleSectionGroup[],
  userPreferredUnit: UserPreferredUnit
): HoleSectionGroupInternal[] => {
  return holeSectionGroups.map((holeSectionGroup) => {
    const { sections, sizeUnit, measuredDepthUnit } = holeSectionGroup;

    return {
      ...holeSectionGroup,
      measuredDepthUnit: userPreferredUnit,
      sizeUnit: SIZE_UNIT,
      sections: normalizeHoleSections(
        sections,
        sizeUnit,
        measuredDepthUnit,
        userPreferredUnit
      ),
    };
  });
};
