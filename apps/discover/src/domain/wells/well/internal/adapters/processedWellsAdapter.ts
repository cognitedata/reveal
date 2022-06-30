import { TrajectoryInternal } from 'domain/wells/trajectory/internal/types';
import { Well } from 'domain/wells/well/internal/types';
import { keyByWellbore } from 'domain/wells/wellbore/internal/transformers/keyByWellbore';

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
  trajectories: TrajectoryInternal[] = []
): ProcessedWells => {
  const keyedTrajectories = keyByWellbore(trajectories);

  if (!wells) {
    return { processedWells: [], wellboresCount: 0, wellsCount: 0 };
  }
  return wells.reduce<ProcessedWells>(
    (acc, well) => {
      const item = waterDepthAdapter(well, userPreferredUnit);
      const wellboresCount: number = well?.wellbores?.length || 0;

      const wellbores = well.wellbores?.map((wellbore) => {
        const trajectoryData = keyedTrajectories[wellbore.matchingId];

        if (!trajectoryData) {
          return { ...wellbore };
        }

        const { maxMeasuredDepth, maxTrueVerticalDepth, maxDoglegSeverity } =
          trajectoryData;

        return {
          ...wellbore,
          maxMeasuredDepth,
          maxTrueVerticalDepth,
          maxDoglegSeverity,
        };
      });

      return {
        ...acc,
        processedWells: [...acc.processedWells, { ...item, wellbores }],
        wellboresCount: acc.wellboresCount + wellboresCount,
      };
    },
    { processedWells: [], wellboresCount: 0, wellsCount: wells.length }
  );
};
