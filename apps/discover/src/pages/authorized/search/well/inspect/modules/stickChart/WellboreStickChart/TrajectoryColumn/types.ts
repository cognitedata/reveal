import {
  TrajectoryChartDataAccessor,
  TrajectoryChartPlane,
} from 'domain/wells/trajectory/internal/types';

export interface TrajectoryColumnConfig {
  accessors: Partial<Record<TrajectoryChartPlane, TrajectoryChartDataAccessor>>;
  axisNames: {
    x: string;
    y: string;
  };
}
