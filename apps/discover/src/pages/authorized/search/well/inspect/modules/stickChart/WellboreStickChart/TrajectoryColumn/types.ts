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
  MD_ED = 'MD vs ED',
  TVD_ED = 'TVD vs ED',
  NS_EW = 'NS vs EW',
}
