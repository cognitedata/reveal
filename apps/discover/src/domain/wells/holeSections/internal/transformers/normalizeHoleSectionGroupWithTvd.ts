import { UserPreferredUnit } from 'constants/units';

import {
  HoleSectionGroupInternalWithTvd,
  HoleSectionGroupWithTvd,
} from '../types';

import { normalizeHoleSectionGroup } from './normalizeHoleSectionGroup';
import { normalizeHoleSectionWithTvd } from './normalizeHoleSectionWithTvd';

export const normalizeHoleSectionGroupWithTvd = (
  holeSectionGroup: HoleSectionGroupWithTvd,
  userPreferredUnit: UserPreferredUnit
): HoleSectionGroupInternalWithTvd => {
  const { sections, sizeUnit, measuredDepthUnit, trueVerticalDepthUnit } =
    holeSectionGroup;

  return {
    ...normalizeHoleSectionGroup(holeSectionGroup, userPreferredUnit),
    trueVerticalDepthUnit: userPreferredUnit,
    sections: sections.map((section, index) =>
      normalizeHoleSectionWithTvd(
        section,
        sizeUnit,
        measuredDepthUnit,
        trueVerticalDepthUnit,
        userPreferredUnit,
        index
      )
    ),
  };
};
