import {
  CasingAssemblyInternal,
  CasingSchematicInternal,
} from 'domain/wells/casings/internal/types';
import { DepthMeasurementWithData } from 'domain/wells/measurements/internal/types';
import { NdsInternal } from 'domain/wells/nds/internal/types';
import { NptInternal } from 'domain/wells/npt/internal/types';
import { TrajectoryWithData } from 'domain/wells/trajectory/internal/types';
import { WellTopsInternal } from 'domain/wells/wellTops/internal/types';

import { ConvertedDistance } from 'utils/units/constants';

export interface CasingSchematicView extends CasingSchematicInternal {
  wellName: string;
  wellboreName: string;
  wellboreColor: string;
  casingAssemblies: Array<CasingAssemblyView>;
  rkbLevel?: ConvertedDistance;
  waterDepth?: ConvertedDistance;
  nptEvents: NptInternal[];
  ndsEvents: NdsInternal[];
  wellTop?: WellTopsInternal;
  trajectoriesData: TrajectoryWithData;
  measurementsData?: DepthMeasurementWithData;
}

export interface CasingAssemblyView extends CasingAssemblyInternal {
  trueVerticalDepthTop?: ConvertedDistance;
  trueVerticalDepthBase?: ConvertedDistance;
  outsideDiameterFormatted: string;
  isLiner: boolean;
}

export enum ChartColumn {
  FORMATION = 'Formation',
  CASINGS = 'Casings',
  NDS = 'NDS',
  NPT = 'NPT',
  SUMMARY = 'Section Summary',
  TRAJECTORY = 'Trajectory',
  MEASUREMENTS = 'FIT and LOT',
}
