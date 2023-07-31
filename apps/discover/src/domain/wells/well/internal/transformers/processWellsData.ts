import { TrajectoryInternal } from 'domain/wells/trajectory/internal/types';
import { WellInternal } from 'domain/wells/well/internal/types';
import { keyByWellbore } from 'domain/wells/wellbore/internal/transformers/keyByWellbore';

type ProcessedWellsData = {
  processedWells: WellInternal[];
  wellboresCount: number;
  wellsCount: number;
};

export const processWellsData = (
  wells: WellInternal[],
  trajectories: TrajectoryInternal[] = []
): ProcessedWellsData => {
  const keyedTrajectories = keyByWellbore(trajectories);

  if (!wells) {
    return { processedWells: [], wellboresCount: 0, wellsCount: 0 };
  }
  return wells.reduce<ProcessedWellsData>(
    (acc, well) => {
      const wellboresCount: number = well.wellbores.length;

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
        processedWells: [...acc.processedWells, { ...well, wellbores }],
        wellboresCount: acc.wellboresCount + wellboresCount,
      };
    },
    { processedWells: [], wellboresCount: 0, wellsCount: wells.length }
  );
};
