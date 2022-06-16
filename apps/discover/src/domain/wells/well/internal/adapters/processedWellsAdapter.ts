import { adaptTrajectoryDataToWellbores } from 'domain/wells/trajectory/internal/adapters/adaptTrajectoryDataToWellbores';
import { TrajectoryData } from 'domain/wells/trajectory/service/types';
import { Well } from 'domain/wells/well/internal/types';

import { UserPreferredUnit } from 'constants/units';

import { waterDepthAdapter } from './waterDepthAdapter';

type ProcessedWells = {
  processedWells: Well[];
  wellboresCount: number;
  wellsCount: number;
};

export const processedWellsAdapter = (
  wells: Well[],
  userPreferredUnit?: UserPreferredUnit,
  trajectoryData?: TrajectoryData[]
): ProcessedWells => {
  if (!wells) {
    return { processedWells: [], wellboresCount: 0, wellsCount: 0 };
  }
  return wells.reduce<ProcessedWells>(
    (acc, well) => {
      const item = waterDepthAdapter(well, userPreferredUnit);
      const wellboresCount: number = well?.wellbores?.length || 0;

      const wellbores = adaptTrajectoryDataToWellbores(
        well,
        userPreferredUnit,
        trajectoryData
      );

      return {
        ...acc,
        processedWells: [...acc.processedWells, { ...item, wellbores }],
        wellboresCount: acc.wellboresCount + wellboresCount,
      };
    },
    { processedWells: [], wellboresCount: 0, wellsCount: wells.length }
  );
};
