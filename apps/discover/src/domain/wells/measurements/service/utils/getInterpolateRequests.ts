import { toIdentifierWithMatchingId } from 'domain/wells/utils/toIdentifierWithMatchingId';
import { groupByWellbore } from 'domain/wells/wellbore/internal/transformers/groupByWellbore';

import { Distance } from 'convert-units';
import compact from 'lodash/compact';
import head from 'lodash/head';
import { toDistanceUnit } from 'utils/units/toDistanceUnit';

import { TrajectoryInterpolationRequest } from '@cognite/sdk-wells';

import { UserPreferredUnit } from 'constants/units';

type DepthMeasurementType = {
  wellboreMatchingId: string;
  depthUnit: Distance;
  rows: Array<{ depth: number }>;
};

export const getInterpolateRequests = <T extends DepthMeasurementType>(
  depthMeasurements: T[],
  userPreferredUnit?: UserPreferredUnit
): TrajectoryInterpolationRequest[] => {
  const groupedDepthMeasurements = groupByWellbore(depthMeasurements);

  return compact(
    Object.keys(groupedDepthMeasurements).map((wellboreMatchingId) => {
      const wellboreDepthMeasurements =
        groupedDepthMeasurements[wellboreMatchingId];

      const measuredDepths = wellboreDepthMeasurements.flatMap(({ rows }) =>
        rows.map(({ depth }) => depth)
      );

      const measuredDepthUnit = head(wellboreDepthMeasurements)?.depthUnit;

      if (!measuredDepthUnit) {
        return null;
      }

      return {
        wellboreId: toIdentifierWithMatchingId(wellboreMatchingId),
        measuredDepths,
        measuredDepthUnit: toDistanceUnit(measuredDepthUnit),
        trueVerticalDepthUnit:
          userPreferredUnit && toDistanceUnit(userPreferredUnit),
      };
    })
  );
};
