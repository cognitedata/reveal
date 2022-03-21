import { ProjectConfigWells } from '@cognite/discover-api-types';
import { SequenceColumn } from '@cognite/sdk';

import { UserPreferredUnit } from 'constants/units';
import { TrajectoryRow, TrajectoryRows } from 'modules/wellSearch/types';
import { ChartDataConfig } from 'tenants/types';

export type AddData = {
  row: TrajectoryRow;
  chartData: ChartDataConfig;
  columnData?: SequenceColumn[];
  config?: ProjectConfigWells;
  selectedTrajectoryData: (TrajectoryRows | undefined)[];
  userPreferredUnit: UserPreferredUnit;
};
