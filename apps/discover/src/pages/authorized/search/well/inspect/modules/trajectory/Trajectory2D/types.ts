import { ProjectConfigWells } from '@cognite/discover-api-types';
import { SequenceColumn } from '@cognite/sdk';

import { UserPreferredUnit } from 'constants/units';
import {
  Sequence,
  TrajectoryRow,
  TrajectoryRows,
} from 'modules/wellSearch/types';
import { ChartDataConfig } from 'tenants/types';

import { Data } from '../../common/Chart/types';

export type AddData = {
  row: TrajectoryRow;
  chartData: ChartDataConfig;
  columnData?: SequenceColumn[];
  config?: ProjectConfigWells;
  selectedTrajectoryData: (TrajectoryRows | undefined)[];
  userPreferredUnit: UserPreferredUnit;
};

export interface Trajectory2DProps {
  selectedTrajectoryData: (TrajectoryRows | undefined)[];
  selectedTrajectories: Sequence[];
}

export interface TrajectoryChartProps {
  data: Data;
  index: number;
}
