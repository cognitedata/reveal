import { toIdentifierWithMatchingId } from 'domain/wells/utils/toIdentifierWithMatchingId';
import { groupByWellbore } from 'domain/wells/wellbore/internal/transformers/groupByWellbore';

import head from 'lodash/head';
import { toDistanceUnit } from 'utils/units/toDistanceUnit';

import {
  DistanceUnitEnum,
  TrajectoryInterpolationRequest,
} from '@cognite/sdk-wells';

import { UserPreferredUnit } from 'constants/units';

import { DepthIndexColumnInternal } from '../../internal/types';

type DepthMeasurementType = {
  wellboreMatchingId: string;
  depthColumn: DepthIndexColumnInternal;
  rows: Array<{ depth: number }>;
};

export const getInterpolateRequests = <T extends DepthMeasurementType>(
  depthMeasurements: T[],
  userPreferredUnit?: UserPreferredUnit
): TrajectoryInterpolationRequest[] => {
  const groupedDepthMeasurements = groupByWellbore(depthMeasurements);

  return Object.keys(groupedDepthMeasurements).map((wellboreMatchingId) => {
    const wellboreDepthMeasurements =
      groupedDepthMeasurements[wellboreMatchingId];

    const measuredDepths = wellboreDepthMeasurements.flatMap(({ rows }) =>
      rows.map(({ depth }) => depth)
    );

    const measuredDepthUnit =
      head(wellboreDepthMeasurements)?.depthColumn.unit ||
      DistanceUnitEnum.Meter;

    return {
      wellboreId: toIdentifierWithMatchingId(wellboreMatchingId),
      measuredDepths,
      measuredDepthUnit: toDistanceUnit(measuredDepthUnit),
      trueVerticalDepthUnit:
        userPreferredUnit && toDistanceUnit(userPreferredUnit),
    };
  });
};
