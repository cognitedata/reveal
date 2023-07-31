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
    const holeTopValues = withoutNil(nds.map(({ holeTop }) => holeTop?.value));
    const holeBaseValues = withoutNil(
      nds.map(({ holeBase }) => holeBase?.value)
    );
    const ndsWithMeasurement = nds.find(
      ({ holeTop, holeBase }) => holeTop || holeBase
    );
    const measuredDepthUnit =
      ndsWithMeasurement?.holeTop?.unit ||
      ndsWithMeasurement?.holeBase?.unit ||
      DEFAULT_MEASURED_DEPTH_UNIT;

    return {
      wellboreId: toIdentifierWithMatchingId(wellboreMatchingId),
      measuredDepths: [...holeTopValues, ...holeBaseValues],
      measuredDepthUnit: toDistanceUnit(measuredDepthUnit),
      trueVerticalDepthUnit:
        userPreferredUnit && toDistanceUnit(userPreferredUnit),
    };
  });
};
