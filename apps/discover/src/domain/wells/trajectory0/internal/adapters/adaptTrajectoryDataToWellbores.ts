import { Well } from 'domain/wells/well/internal/types';
import { Wellbore } from 'domain/wells/wellbore/internal/types';

import groupBy from 'lodash/groupBy';
import { toFixedNumberFromNumber } from 'utils/number';

import { METER, UserPreferredUnit } from 'constants/units';

import { TrajectoryData } from '../../service/types';
import { getUnitConvertedFixedValue } from '../transformers/getUnitConvertedFixedValue';

// Adding 'tvd', 'md' & 'dls' to wellbores
export const adaptTrajectoryDataToWellbores = (
  well: Well,
  userPreferredUnit?: UserPreferredUnit,
  trajectoryData?: TrajectoryData[]
) => {
  // unit of 'md' & 'tvd' is always in 'meters' in trajectory/list
  const groupedTrajectories = groupBy(trajectoryData, 'wellboreMatchingId');

  return well.wellbores?.reduce(
    (wellboreList: Wellbore[], currentWellbore: Wellbore) => {
      if (
        !currentWellbore.matchingId ||
        !groupedTrajectories[currentWellbore.matchingId]
      ) {
        return [...wellboreList, currentWellbore];
      }

      return [
        ...wellboreList,
        {
          ...currentWellbore,
          maxMeasuredDepth: getUnitConvertedFixedValue(
            groupedTrajectories[currentWellbore.matchingId][0].maxMeasuredDepth,
            METER,
            userPreferredUnit
          ),
          maxTrueVerticalDepth: getUnitConvertedFixedValue(
            groupedTrajectories[currentWellbore.matchingId][0]
              .maxTrueVerticalDepth,
            METER,
            userPreferredUnit
          ),
          maxDoglegSeverity: {
            value: toFixedNumberFromNumber(
              groupedTrajectories[currentWellbore.matchingId][0]
                .maxDoglegSeverity.value
            ),
            unit: groupedTrajectories[currentWellbore.matchingId][0]
              .maxDoglegSeverity.unit,
          },
        },
      ];
    },
    []
  );
};
