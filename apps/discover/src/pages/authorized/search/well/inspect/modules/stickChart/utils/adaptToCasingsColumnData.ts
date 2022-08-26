import { sortCasingAssembliesByMDBase } from 'domain/wells/casings/internal/transformers/sortCasingAssembliesByMDBase';
import { CasingSchematicInternal } from 'domain/wells/casings/internal/types';
import { KeyedTvdData } from 'domain/wells/trajectory/internal/types';

import { CasingAssemblyView } from '../types';

import { adaptCasingAssembliesDataToView } from './adaptCasingAssembliesDataToView';

export const adaptToCasingsColumnData = (
  casingsData: CasingSchematicInternal[],
  tvdData: KeyedTvdData
): CasingAssemblyView[] => {
  return casingsData.flatMap((data) => {
    const { wellboreMatchingId, casingAssemblies } = data;

    const adaptedCasingAssemblies = adaptCasingAssembliesDataToView(
      wellboreMatchingId,
      casingAssemblies,
      tvdData[wellboreMatchingId]
    );

    return sortCasingAssembliesByMDBase(adaptedCasingAssemblies);
  });
};
