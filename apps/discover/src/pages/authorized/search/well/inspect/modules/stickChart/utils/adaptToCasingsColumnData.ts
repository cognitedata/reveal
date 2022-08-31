import { sortCasingAssembliesByMDBase } from 'domain/wells/casings/internal/transformers/sortCasingAssembliesByMDBase';
import { CasingSchematicInternalWithTvd } from 'domain/wells/casings/internal/types';

import { CasingAssemblyView } from '../types';

import { adaptCasingAssembliesDataToView } from './adaptCasingAssembliesDataToView';

export const adaptToCasingsColumnData = (
  casingsData: CasingSchematicInternalWithTvd[]
): CasingAssemblyView[] => {
  return casingsData.flatMap((data) => {
    const { wellboreMatchingId, casingAssemblies } = data;

    const adaptedCasingAssemblies = adaptCasingAssembliesDataToView(
      wellboreMatchingId,
      casingAssemblies
    );

    return sortCasingAssembliesByMDBase(adaptedCasingAssemblies);
  });
};
