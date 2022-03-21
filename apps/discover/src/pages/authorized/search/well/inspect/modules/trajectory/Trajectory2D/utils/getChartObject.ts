import { Sequence } from '@cognite/sdk';

import { TrajectoryRows } from 'modules/wellSearch/types';

import { getWellboreNameForTrajectory } from '../../utils';

const wellboreNameForTrajectory = (
  selectedTrajectories: Sequence[],
  trajectoryId = ''
) => getWellboreNameForTrajectory(trajectoryId, selectedTrajectories);

const getLineObject = (
  selectedTrajectories: Sequence[],
  trajectories: TrajectoryRows | undefined,
  chartExtraData: { [key: string]: any }
) => {
  return {
    x: [] as number[],
    y: [] as number[],
    type: 'scatter',
    mode: 'lines',
    name: wellboreNameForTrajectory(
      selectedTrajectories,
      trajectories?.externalId
    ),
    ...chartExtraData,
  };
};

const get3DObject = (
  selectedTrajectories: Sequence[],
  trajectories: TrajectoryRows | undefined,
  chartExtraData: any
) => {
  return {
    x: [] as number[],
    y: [] as number[],
    z: [] as number[],
    type: 'scatter3d',
    mode: 'lines',
    name: wellboreNameForTrajectory(
      selectedTrajectories,
      trajectories?.externalId
    ),
    ...chartExtraData,
  };
};

// return initial chart object generate functions for differnt chart types.
export const getChartObjectGenerateFn = (type?: string) => {
  switch (type) {
    case 'line':
      return getLineObject;
    case '3d':
      return get3DObject;
    default:
      return getLineObject;
  }
};
