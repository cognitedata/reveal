import { keyBySequence } from 'domain/wells/wellbore/internal/transformers/keyBySequence';

import isEmpty from 'lodash/isEmpty';

import {
  TrajectoryDataInternal,
  TrajectoryInternal,
  TrajectoryWithData,
} from '../types';

export const mergeTrajectoriesAndData = (
  trajectories: TrajectoryInternal[],
  trajectoriesData: TrajectoryDataInternal[]
) => {
  if (isEmpty(trajectoriesData)) {
    return [];
  }

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
