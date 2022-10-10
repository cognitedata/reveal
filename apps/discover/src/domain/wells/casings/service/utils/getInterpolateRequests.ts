import { toIdentifierWithMatchingId } from 'domain/wells/utils/toIdentifierWithMatchingId';
import { groupByWellbore } from 'domain/wells/wellbore/internal/transformers/groupByWellbore';

import head from 'lodash/head';
import isEmpty from 'lodash/isEmpty';
import { toDistanceUnit } from 'utils/units/toDistanceUnit';

import {
  CasingSchematic,
  DistanceUnitEnum,
  TrajectoryInterpolationRequest,
} from '@cognite/sdk-wells';

import { UserPreferredUnit } from 'constants/units';

export const getInterpolateRequests = (
  casingSchematics: CasingSchematic[],
  userPreferredUnit?: UserPreferredUnit
): TrajectoryInterpolationRequest[] => {
  const groupedCasingSchematics = groupByWellbore(casingSchematics);

  return Object.keys(groupedCasingSchematics).map((wellboreMatchingId) => {
    const wellboreCasingSchematics =
      groupedCasingSchematics[wellboreMatchingId];

    const measuredDepths = wellboreCasingSchematics.flatMap(
      ({ casingAssemblies }) =>
        casingAssemblies.flatMap(
          ({ originalMeasuredDepthBase, originalMeasuredDepthTop }) => [
            originalMeasuredDepthBase.value,
            originalMeasuredDepthTop.value,
          ]
        )
    );

    const casingSchematicWithAssemblies = wellboreCasingSchematics.find(
      ({ casingAssemblies }) => !isEmpty(casingAssemblies)
    );

    const casingAssembliesDataUnit = head(
      casingSchematicWithAssemblies?.casingAssemblies
    )?.originalMeasuredDepthBase.unit;

    const measuredDepthUnit =
      casingAssembliesDataUnit || DistanceUnitEnum.Meter;

    return {
      wellboreId: toIdentifierWithMatchingId(wellboreMatchingId),
      measuredDepths,
      measuredDepthUnit: toDistanceUnit(measuredDepthUnit),
      trueVerticalDepthUnit:
        userPreferredUnit && toDistanceUnit(userPreferredUnit),
    };
  });
};
