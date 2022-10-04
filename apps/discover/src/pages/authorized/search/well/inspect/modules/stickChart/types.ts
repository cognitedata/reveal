import { CasingAssemblyInternalWithTvd } from 'domain/wells/casings/internal/types';
import { HoleSectionInternalWithTvd } from 'domain/wells/holeSections/internal/types';
import { DepthMeasurementWithData } from 'domain/wells/measurements/internal/types';
import { NdsInternalWithTvd } from 'domain/wells/nds/internal/types';
import { NptInternalWithTvd } from 'domain/wells/npt/internal/types';
import { TrajectoryWithData } from 'domain/wells/trajectory/internal/types';
import { WellboreInternal } from 'domain/wells/wellbore/internal/types';
import {
  WellTopSurfaceDepthInternal,
  WellTopSurfaceInternal,
} from 'domain/wells/wellTops/internal/types';

import { Distance } from 'convert-units';

import { ProjectConfigWellsTrajectoryCharts } from '@cognite/discover-api-types';

export interface WellboreData {
  wellboreMatchingId: string;
  wellName: string;
  wellboreName: string;
  wellboreColor: string;
  rkbLevel: WellboreInternal['datum'];
  wellWaterDepth: WellboreInternal['wellWaterDepth'];
}

export interface ColumnsData {
  formationColumn: DataWithLoadingStatus<WellTopSurfaceView[]>;
  casingsColumn: DataWithLoadingStatus<CasingAssemblyView[]>;
  nptColumn: DataWithLoadingStatus<NptInternalWithTvd[]>;
  ndsColumn: DataWithLoadingStatus<NdsInternalWithTvd[]>;
  trajectoryColumn: DataWithLoadingStatus<TrajectoryWithData>;
  measurementsColumn: DataWithLoadingStatus<DepthMeasurementWithData>;
  holeSectionsColumn: DataWithLoadingStatus<HoleSectionView[]>;
}

export interface ColumnVisibilityProps {
  isVisible?: boolean;
}

export interface WellTopSurfaceView extends WellTopSurfaceInternal {
  wellboreMatchingId: string;
  depthUnit: Distance;
  top: WellTopSurfaceDepthInternal;
  base: WellTopSurfaceDepthInternal;
  depthDifference: WellTopSurfaceDepthInternal;
  isComputedBase: boolean;
}

export interface CasingAssemblyView extends CasingAssemblyInternalWithTvd {
  wellboreMatchingId: string;
  outsideDiameterFormatted: string;
  isLiner: boolean;
}

export interface HoleSectionView extends HoleSectionInternalWithTvd {
  wellboreMatchingId: string;
}

export enum ChartColumn {
  FORMATION = 'Formation',
  CASINGS = 'Casings',
  DEPTH = 'Depth',
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

export enum SummarySection {
  CasingSpecification = 'Casing Specification',
  HoleDepth = 'Hole Depth (NTH)',
  DrillingParameters = 'Drilling Parameters',
  MudwayWindow = 'Mudway Window',
  HighlightedEvent = 'Highlighted Event',
}

export interface SummaryVisibilityProps {
  isExpanded?: boolean;
}

export interface TrajectoryCurveConfig {
  chartConfig: ProjectConfigWellsTrajectoryCharts;
  axisNames: Record<string, string>;
  title?: string;
}
