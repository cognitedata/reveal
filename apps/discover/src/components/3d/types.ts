import { CogniteEvent } from '@cognite/sdk';
import { DepthMeasurement, DepthMeasurementData } from '@cognite/sdk-wells-v3';

import {
  Sequence,
  TrajectoryRows,
  Well,
  WellboreNPTEventsMap,
} from 'modules/wellSearch/types';

export interface ThreeDeeProps extends WellsData {
  fileId?: string;
}

export interface WellsData {
  wells?: Well[];
  trajectories?: Sequence[];
  trajectoryData?: TrajectoryRows[];
  casings?: Sequence[];
  ndsEvents?: CogniteEvent[];
  nptEvents?: WellboreNPTEventsMap;
  wellLogs?: Record<string, DepthMeasurement[]>;
  wellLogsRowData?: Record<string, DepthMeasurementData>;
}
