import { Trajectory } from '@cognite/sdk-wells-v3';

export const getTrajectoryForWellbore = (
  trajectories: Trajectory[],
  wellboreId: string
) => {
  return trajectories?.find(
    (trajectory) => trajectory.wellboreMatchingId === wellboreId
  );
};
