import { toIdentifierWithMatchingId } from 'domain/wells/utils/toIdentifierWithMatchingId';
import { groupByWellbore } from 'domain/wells/wellbore/internal/transformers/groupByWellbore';

import compact from 'lodash/compact';
import { toDistanceUnit } from 'utils/units/toDistanceUnit';

import {
  DistanceUnitEnum,
  Npt,
  TrajectoryInterpolationRequest,
} from '@cognite/sdk-wells';

import { UserPreferredUnit } from 'constants/units';

import { NptInternal } from '../../internal/types';

export const getInterpolateRequests = (
  nptData: Npt[] | NptInternal[],
  userPreferredUnit?: UserPreferredUnit
): TrajectoryInterpolationRequest[] => {
  const groupedNptData = groupByWellbore(nptData);

  return Object.keys(groupedNptData).map((wellboreMatchingId) => {
    const npt = groupedNptData[wellboreMatchingId];
    const measuredDepths = compact(
      npt.map(({ measuredDepth }) => measuredDepth?.value)
    );
    const nptWithMeasurement = npt.find(({ measuredDepth }) => measuredDepth);
    const measuredDepthUnit =
      nptWithMeasurement?.measuredDepth?.unit || DistanceUnitEnum.Meter;

    return {
      wellboreId: toIdentifierWithMatchingId(wellboreMatchingId),
      measuredDepths,
      measuredDepthUnit: toDistanceUnit(measuredDepthUnit),
      trueVerticalDepthUnit:
        userPreferredUnit && toDistanceUnit(userPreferredUnit),
    };
  });
};
