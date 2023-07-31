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

export enum TrajectoryCurve {
  MD_HD = 'MD vs HD',
  TVD_HD = 'TVD vs HD',
  NS_EW = 'NS vs EW',
}
