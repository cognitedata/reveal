import { adaptToTrajectoryChartDataList } from 'domain/wells/trajectory/internal/transformers/adaptToTrajectoryChartDataList';
import { TrajectoryChartDataList } from 'domain/wells/trajectory/internal/types';

import { ProjectConfigWellsTrajectoryCharts } from '@cognite/discover-api-types';

import { TrajectoryView } from '../types';

export const adaptToChartDataList = (
  trajectories: TrajectoryView[],
  trajectoryCharts: ProjectConfigWellsTrajectoryCharts[]
): TrajectoryChartDataList => {
  return adaptToTrajectoryChartDataList(
    trajectories,
    trajectoryCharts,
    ({ trajectory }) => {
      const { wellboreName, wellboreColor } = trajectory;

      return {
        name: wellboreName,
        line: {
          color: wellboreColor,
        },
      };
    }
  );
};
