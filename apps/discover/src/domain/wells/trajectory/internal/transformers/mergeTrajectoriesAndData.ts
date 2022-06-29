import { keyBySequence } from 'domain/wells/wellbore/internal/transformers/keyBySequence';

import {
  TrajectoryDataInternal,
  TrajectoryInternal,
  TrajectoryWithData,
} from '../types';

export const mergeTrajectoriesAndData = (
  trajectories: TrajectoryInternal[],
  trajectoriesData: TrajectoryDataInternal[]
) => {
  const keyedTrajectoriesData = keyBySequence(trajectoriesData);

  return trajectories.reduce((mergedData, trajectory) => {
    const { sequenceExternalId } = trajectory.source;
    const trajectoryData = keyedTrajectoriesData[sequenceExternalId];

    const trajectoryWithData = {
      ...trajectory,
      ...trajectoryData,
    };

    return [...mergedData, trajectoryWithData];
  }, [] as TrajectoryWithData[]);
};
