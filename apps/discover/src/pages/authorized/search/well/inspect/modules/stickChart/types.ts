import { CasingAssemblyInternal } from 'domain/wells/casings/internal/types';
import { DepthMeasurementWithData } from 'domain/wells/measurements/internal/types';
import { NdsInternal } from 'domain/wells/nds/internal/types';
import { NptInternal } from 'domain/wells/npt/internal/types';
import { TrajectoryWithData } from 'domain/wells/trajectory/internal/types';
import { WellboreInternal } from 'domain/wells/wellbore/internal/types';

import { ConvertedDistance } from 'utils/units/constants';

export interface WellboreData {
  wellboreMatchingId: string;
  wellName: string;
  wellboreName: string;
  wellboreColor: string;
  rkbLevel: WellboreInternal['datum'];
  wellWaterDepth: WellboreInternal['wellWaterDepth'];
}

export interface ColumnsData {
  casingsColumn: DataWithLoadingStatus<CasingAssemblyView[]>;
  nptColumn: DataWithLoadingStatus<NptInternal[]>;
  ndsColumn: DataWithLoadingStatus<NdsInternal[]>;
  trajectoryColumn: DataWithLoadingStatus<TrajectoryWithData>;
  measurementsColumn: DataWithLoadingStatus<DepthMeasurementWithData>;
}

export interface ColumnVisibilityProps {
  isVisible?: boolean;
}

export interface CasingAssemblyView extends CasingAssemblyInternal {
  wellboreMatchingId: string;
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

export interface DataWithLoadingStatus<T> {
  data?: T;
  isLoading: boolean;
}
