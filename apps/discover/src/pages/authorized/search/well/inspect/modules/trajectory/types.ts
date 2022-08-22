import { TrajectoryWithData } from 'domain/wells/trajectory/internal/types';

export interface TrajectoryView extends TrajectoryWithData {
  wellboreName: string;
  wellboreColor: string;
}
