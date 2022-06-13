import { toIdentifierWithMatchingId } from 'domain/wells/utils/toIdentifierWithMatchingId';
import { groupByWellbore } from 'domain/wells/wellbore/internal/transformers/groupByWellbore';

import head from 'lodash/head';
import isEmpty from 'lodash/isEmpty';
import { toDistanceUnit } from 'utils/units/toDistanceUnit';

import {
  DistanceUnitEnum,
  TrajectoryInterpolationRequest,
} from '@cognite/sdk-wells-v3';

import { UserPreferredUnit } from 'constants/units';

import { CasingSchematicInternal } from '../../internal/types';

export const getInterpolateRequests = (
  casingSchematics: CasingSchematicInternal[],
  userPreferredUnit?: UserPreferredUnit
): TrajectoryInterpolationRequest[] => {
  const groupedCasingSchematics = groupByWellbore(casingSchematics);

  return Object.keys(groupedCasingSchematics).map((wellboreMatchingId) => {
    const wellboreCasingSchematics =
      groupedCasingSchematics[wellboreMatchingId];

    const measuredDepths = wellboreCasingSchematics.flatMap(
      ({ casingAssemblies }) =>
        casingAssemblies.flatMap(({ measuredDepthBase, measuredDepthTop }) => [
          measuredDepthBase.value,
          measuredDepthTop.value,
        ])
    );

    const casingSchematicWithAssemblies = wellboreCasingSchematics.find(
      ({ casingAssemblies }) => !isEmpty(casingAssemblies)
    );

    const casingAssembliesDataUnit = head(
      casingSchematicWithAssemblies?.casingAssemblies
    )?.measuredDepthBase.unit;

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
