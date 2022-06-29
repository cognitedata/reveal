import { CasingSchematicInternal } from 'domain/wells/casings/internal/types';
import { NdsInternalWithTvd } from 'domain/wells/nds/internal/types';
import { NptInternal } from 'domain/wells/npt/internal/types';
import { TrajectoryWithData } from 'domain/wells/trajectory/internal/types';
import { Well } from 'domain/wells/well/internal/types';

import { DepthMeasurement, DepthMeasurementData } from '@cognite/sdk-wells-v3';

export interface ThreeDeeProps extends WellsData {
  fileId?: string;
}

export interface WellsData {
  wells?: Well[];
  trajectories?: TrajectoryWithData[];
  casings?: CasingSchematicInternal[];
  ndsEvents?: NdsInternalWithTvd[];
  nptEvents?: NptInternal[];
  wellLogs?: Record<string, DepthMeasurement[]>;
  wellLogsRowData?: Record<string, DepthMeasurementData>;
}
