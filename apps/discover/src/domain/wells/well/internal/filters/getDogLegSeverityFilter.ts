import { filters } from 'domain/wells/well/internal/filters';

import { isNumberTuple } from 'utils/types/isNumberTuple';
import { toDistanceUnitEnum } from 'utils/units/toDistanceUnitEnum';

import { ProjectConfigWellsWellCharacteristicsFilterDls } from '@cognite/discover-api-types';
import { AngleUnitEnum, WellFilter } from '@cognite/sdk-wells-v3';

import { UserPreferredUnit } from 'constants/units';

export const getDogLegSeverityFilter = (
  value?: unknown,
  unit?: UserPreferredUnit,
  wellCharacteristicsDls?: ProjectConfigWellsWellCharacteristicsFilterDls
): Pick<WellFilter, 'trajectories'> => {
  if (isNumberTuple(value) && unit) {
    return {
      trajectories: {
        maxDoglegSeverity: filters.toRange(value, {
          angleUnit: AngleUnitEnum.Degree,
          distanceUnit: toDistanceUnitEnum(unit),
          distanceInterval:
            unit === UserPreferredUnit.FEET
              ? wellCharacteristicsDls?.feetDistanceInterval
              : wellCharacteristicsDls?.meterDistanceInterval,
        }),
      },
    };
  }

  return {};
};
