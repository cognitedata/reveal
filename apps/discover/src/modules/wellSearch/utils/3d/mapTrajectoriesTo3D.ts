import { ITrajectory } from '@cognite/node-visualizer';
import { Sequence } from '@cognite/sdk';

export const mapTrajectoriesTo3D = (
  trajectories: Sequence[]
): Partial<ITrajectory>[] =>
  trajectories.map((trajectory) => {
    return {
      ...trajectory,
      id: String(trajectory.id) || '',
      assetId: String(trajectory.assetId) || '',
      externalId: trajectory.externalId || '',
    };
  });
