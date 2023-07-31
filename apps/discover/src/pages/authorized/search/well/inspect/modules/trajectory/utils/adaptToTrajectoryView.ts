import { TrajectoryWithData } from 'domain/wells/trajectory/internal/types';
import { WellboreInternal } from 'domain/wells/wellbore/internal/types';

import { TrajectoryView } from '../types';

export const adaptToTrajectoryView = (
  trajectory: TrajectoryWithData,
  wellbore: WellboreInternal
): TrajectoryView => {
  return {
    ...trajectory,
    wellboreName: wellbore.name,
    wellboreColor: wellbore.color,
  };
};
