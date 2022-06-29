import { TrajectoryWithData } from 'domain/wells/trajectory/internal/types';
import { Wellbore } from 'domain/wells/wellbore/internal/types';

import { TrajectoryView } from '../types';

export const adaptToTrajectoryView = (
  trajectory: TrajectoryWithData,
  wellbore: Wellbore
): TrajectoryView => {
  return {
    ...trajectory,
    wellboreName: wellbore.name,
  };
};
