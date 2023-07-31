import { HoleSectionGroup } from '@cognite/sdk-wells';

import { UserPreferredUnit } from 'constants/units';

import { SIZE_UNIT } from '../../constants';
import { HoleSectionGroupInternal } from '../types';

import { normalizeHoleSection } from './normalizeHoleSection';

export const normalizeHoleSectionGroup = (
  holeSectionGroup: HoleSectionGroup,
  userPreferredUnit: UserPreferredUnit
): HoleSectionGroupInternal => {
  const { sections, sizeUnit, measuredDepthUnit } = holeSectionGroup;

  return {
    ...holeSectionGroup,
    measuredDepthUnit: userPreferredUnit,
    sizeUnit: SIZE_UNIT,
    sections: sections.map((section, index) =>
      normalizeHoleSection(
        section,
        sizeUnit,
        measuredDepthUnit,
        userPreferredUnit,
        index
      )
    ),
  };
};
