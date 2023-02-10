import { CasingSchematicInternalWithTvd } from 'domain/wells/casings/internal/types';

import { CasingAssemblyView } from '../types';

import { adaptCasingAssembliesDataToView } from './adaptCasingAssembliesDataToView';

export const adaptToCasingsColumnData = (
  casingsData: CasingSchematicInternalWithTvd[]
): CasingAssemblyView[] => {
  return casingsData.flatMap((data) => {
    const { wellboreMatchingId, casingAssemblies } = data;

    return adaptCasingAssembliesDataToView(
      wellboreMatchingId,
      casingAssemblies
    );
  });
};
