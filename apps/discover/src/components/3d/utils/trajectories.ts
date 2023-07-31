import { TrajectoryInternal } from 'domain/wells/trajectory/internal/types';

import { ITrajectory } from '@cognite/node-visualizer';

export const mapTrajectoriesTo3D = (
  trajectories: TrajectoryInternal[]
): Partial<ITrajectory>[] =>
  trajectories.map(
    ({ wellboreMatchingId, wellboreAssetExternalId, source }) => {
      return {
        id: wellboreMatchingId,
        assetId: wellboreAssetExternalId,
        externalId: source.sequenceExternalId,
        name: source.sourceName,
      };
    }
  );
