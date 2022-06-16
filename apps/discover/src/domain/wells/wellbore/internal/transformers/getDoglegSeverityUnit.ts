import { DogLegSeverityUnit } from 'domain/wells/wellbore/internal/types';

import { Trajectory } from '@cognite/sdk-wells-v3';

export const getDoglegSeverityUnit = (
  trajectories?: Trajectory[]
): DogLegSeverityUnit | undefined => {
  if (!trajectories) return undefined;

  return trajectories.find((trajectory) => trajectory.maxDoglegSeverity.unit)
    ?.maxDoglegSeverity.unit;
};
