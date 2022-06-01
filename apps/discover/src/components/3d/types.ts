import { Well } from 'domain/wells/well/internal/types';

import { DepthMeasurement, DepthMeasurementData } from '@cognite/sdk-wells-v3';

import {
  CogniteEventV3ish,
  Sequence,
  TrajectoryRows,
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
  ndsEvents?: CogniteEventV3ish[];
  nptEvents?: WellboreNPTEventsMap;
  wellLogs?: Record<string, DepthMeasurement[]>;
  wellLogsRowData?: Record<string, DepthMeasurementData>;
}
