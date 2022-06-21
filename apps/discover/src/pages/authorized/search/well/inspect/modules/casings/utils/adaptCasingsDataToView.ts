import { sortCasingAssembliesByMDBase } from 'domain/wells/casings/internal/transformers/sortCasingAssembliesByMDBase';
import { CasingSchematicInternal } from 'domain/wells/casings/internal/types';
import { NdsInternal } from 'domain/wells/nds/internal/types';
import { NptInternal } from 'domain/wells/npt/internal/types';
import { KeyedTvdData } from 'domain/wells/trajectory/internal/types';
import { getWaterDepth } from 'domain/wells/well/internal/selectors/getWaterDepth';
import { Well } from 'domain/wells/well/internal/types';
import { getRkbLevel } from 'domain/wells/wellbore/internal/selectors/getRkbLevel';
import { keyByWellbore } from 'domain/wells/wellbore/internal/transformers/keyByWellbore';

import compact from 'lodash/compact';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import { adaptToConvertedDistance } from 'utils/units/adaptToConvertedDistance';

import { UserPreferredUnit } from 'constants/units';

import { CasingSchematicView } from '../types';

import { adaptCasingAssembliesDataToView } from './adaptCasingAssembliesDataToView';

export const adaptCasingsDataToView = (
  wells: Well[],
  casingsData: CasingSchematicInternal[],
  tvdData: KeyedTvdData,
  nptData: Record<string, NptInternal[]>,
  ndsData: Record<string, NdsInternal[]>,
  userPreferredUnit: UserPreferredUnit
): CasingSchematicView[] => {
  if (isEmpty(casingsData)) {
    return [];
  }

  const keyedCasingsData = keyByWellbore(casingsData);

  const casingViews = wells.flatMap((well) =>
    (well.wellbores || []).map((wellbore) => {
      const { matchingId: wellboreMatchingId, name: wellboreName } = wellbore;

      const casingSchematic = keyedCasingsData[wellboreMatchingId];
      const trueVerticalDepths = tvdData[wellboreMatchingId];

      // If no casings for the current wellbore.
      if (isUndefined(casingSchematic)) {
        return null;
      }

      const casingAssemblies = adaptCasingAssembliesDataToView(
        casingSchematic.casingAssemblies,
        trueVerticalDepths
      );

      const rkbLevel = getRkbLevel(wellbore, userPreferredUnit);
      const waterDepth = getWaterDepth(well, userPreferredUnit);

      return {
        ...casingSchematic,
        casingAssemblies: sortCasingAssembliesByMDBase(casingAssemblies),
        wellName: well.name,
        wellboreName,
        rkbLevel: adaptToConvertedDistance(
          rkbLevel?.value || 0,
          userPreferredUnit
        ),
        waterDepth: adaptToConvertedDistance(
          waterDepth?.value || 0,
          userPreferredUnit
        ),
        nptEvents: nptData[wellboreMatchingId] || [],
        ndsEvents: ndsData[wellboreMatchingId] || [],
      };
    })
  );

  return compact(casingViews);
};
