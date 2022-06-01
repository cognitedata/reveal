import { Well } from 'domain/wells/well/internal/types';

import { waterDepthAdapter } from './waterDepthAdapter';

type ProcessedWells = {
  processedWells: Well[];
  wellboresCount: number;
  wellsCount: number;
};

export const processedWellsAdapter = (
  wells: Well[],
  userPreferredUnit?: string
): ProcessedWells => {
  if (!wells) {
    return { processedWells: [], wellboresCount: 0, wellsCount: 0 };
  }

  return wells.reduce<ProcessedWells>(
    (acc, well) => {
      const item = waterDepthAdapter(well, userPreferredUnit);
      const wellboresCount: number = well?.wellbores?.length || 0;

      return {
        ...acc,
        processedWells: [...acc.processedWells, item],
        wellboresCount: acc.wellboresCount + wellboresCount,
      };
    },
    { processedWells: [], wellboresCount: 0, wellsCount: wells.length }
  );
};
