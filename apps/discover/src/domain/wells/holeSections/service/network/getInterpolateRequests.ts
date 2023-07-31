import { toIdentifierWithMatchingId } from 'domain/wells/utils/toIdentifierWithMatchingId';
import { groupByWellbore } from 'domain/wells/wellbore/internal/transformers/groupByWellbore';

import compact from 'lodash/compact';
import head from 'lodash/head';
import { toDistanceUnit } from 'utils/units/toDistanceUnit';

import {
  HoleSectionGroup,
  DistanceUnitEnum,
  TrajectoryInterpolationRequest,
} from '@cognite/sdk-wells';

import { UserPreferredUnit } from 'constants/units';

export const getInterpolateRequests = (
  holeSections: HoleSectionGroup[],
  userPreferredUnit?: UserPreferredUnit
): TrajectoryInterpolationRequest[] => {
  const groupedHoleSections = groupByWellbore(holeSections);

  return Object.keys(groupedHoleSections).map((wellboreMatchingId) => {
    const wellboreHoleSections = groupedHoleSections[wellboreMatchingId];

    const measuredDepths = compact(
      wellboreHoleSections.flatMap(({ sections }) =>
        sections.flatMap(({ topMeasuredDepth, baseMeasuredDepth }) => [
          topMeasuredDepth,
          baseMeasuredDepth,
        ])
      )
    );

    const measuredDepthUnit =
      head(wellboreHoleSections)?.measuredDepthUnit || DistanceUnitEnum.Meter;

    return {
      wellboreId: toIdentifierWithMatchingId(wellboreMatchingId),
      measuredDepths,
      measuredDepthUnit: toDistanceUnit(measuredDepthUnit),
      trueVerticalDepthUnit:
        userPreferredUnit && toDistanceUnit(userPreferredUnit),
    };
  });
};
