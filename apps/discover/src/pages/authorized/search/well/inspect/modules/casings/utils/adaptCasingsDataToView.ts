import { sortCasingAssembliesByMDBase } from 'domain/wells/casings/internal/transformers/sortCasingAssembliesByMDBase';
import { CasingSchematicInternal } from 'domain/wells/casings/internal/types';
import { NdsInternal } from 'domain/wells/nds/internal/types';
import { NptInternal } from 'domain/wells/npt/internal/types';
import { WellInternal } from 'domain/wells/well/internal/types';
import { getRkbLevel } from 'domain/wells/wellbore/internal/selectors/getRkbLevel';
import { keyByWellbore } from 'domain/wells/wellbore/internal/transformers/keyByWellbore';

import { EMPTY_ARRAY } from 'constants/empty';

import { CasingSchematicView } from '../types';

import { adaptCasingAssembliesDataToView } from './adaptCasingAssembliesDataToView';

export const adaptCasingsDataToView = (
  wells: WellInternal[],
  casingsData: CasingSchematicInternal[],
  nptData: Record<string, NptInternal[]>,
  ndsData: Record<string, NdsInternal[]>
): CasingSchematicView[] => {
  const keyedCasingsData = keyByWellbore(casingsData);

  return wells.flatMap((well) =>
    (well.wellbores || []).map((wellbore) => {
      const { matchingId: wellboreMatchingId, name: wellboreName } = wellbore;

      const casingSchematic = keyedCasingsData[wellboreMatchingId];

      const casingAssemblies = adaptCasingAssembliesDataToView(
        casingSchematic?.casingAssemblies || EMPTY_ARRAY
      );

      return {
        ...casingSchematic,
        casingAssemblies: sortCasingAssembliesByMDBase(casingAssemblies),
        wellName: well.name,
        wellboreName,
        rkbLevel: getRkbLevel(wellbore),
        waterDepth: well.waterDepth,
        nptEvents: nptData[wellboreMatchingId] || EMPTY_ARRAY,
        ndsEvents: ndsData[wellboreMatchingId] || EMPTY_ARRAY,
      };
    })
  );
};
