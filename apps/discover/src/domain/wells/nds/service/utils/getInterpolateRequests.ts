import { toIdentifierWithMatchingId } from 'domain/wells/utils/toIdentifierWithMatchingId';
import { groupByWellbore } from 'domain/wells/wellbore/internal/transformers/groupByWellbore';

import { toDistanceUnit } from 'utils/units/toDistanceUnit';
import { withoutNil } from 'utils/withoutNil';

import { Nds, TrajectoryInterpolationRequest } from '@cognite/sdk-wells';

import { UserPreferredUnit } from 'constants/units';

import { DEFAULT_MEASURED_DEPTH_UNIT } from '../constants';

export const getInterpolateRequests = (
  ndsData: Nds[],
  userPreferredUnit?: UserPreferredUnit
): TrajectoryInterpolationRequest[] => {
  const groupedNdsData = groupByWellbore(ndsData);

  return Object.keys(groupedNdsData).map((wellboreMatchingId) => {
    const nds = groupedNdsData[wellboreMatchingId];
    const holeStartValues = withoutNil(
      nds.map(({ holeStart }) => holeStart?.value)
    );
    const holeEndValues = withoutNil(nds.map(({ holeEnd }) => holeEnd?.value));
    const ndsWithMeasurement = nds.find(
      ({ holeStart, holeEnd }) => holeStart || holeEnd
    );
    const measuredDepthUnit =
      ndsWithMeasurement?.holeStart?.unit ||
      ndsWithMeasurement?.holeEnd?.unit ||
      DEFAULT_MEASURED_DEPTH_UNIT;

    return {
      wellboreId: toIdentifierWithMatchingId(wellboreMatchingId),
      measuredDepths: [...holeStartValues, ...holeEndValues],
      measuredDepthUnit: toDistanceUnit(measuredDepthUnit),
      trueVerticalDepthUnit:
        userPreferredUnit && toDistanceUnit(userPreferredUnit),
    };
  });
};
