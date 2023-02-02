import { CasingAssemblyInternalWithTvd } from 'domain/wells/casings/internal/types';
import { HoleSectionInternalWithTvd } from 'domain/wells/holeSections/internal/types';
import { DepthMeasurementWithData } from 'domain/wells/measurements/internal/types';
import { NdsInternalWithTvd } from 'domain/wells/nds/internal/types';
import { NptInternalWithTvd } from 'domain/wells/npt/internal/types';
import { TrajectoryWithData } from 'domain/wells/trajectory/internal/types';
import {
  KickoffDepth,
  DrillingDays,
  WellboreInternal,
} from 'domain/wells/wellbore/internal/types';
import {
  WellTopSurfaceDepthInternal,
  WellTopSurfaceInternal,
} from 'domain/wells/wellTops/internal/types';

import { Distance } from 'convert-units';

import { ProjectConfigWellsTrajectoryCharts } from '@cognite/discover-api-types';

import { EVENT_TYPES } from './WellboreStickChart/constants';

export interface WellboreData
  extends Pick<
    WellboreInternal,
    'wellWaterDepth' | 'uniqueWellboreIdentifier'
  > {
  wellboreMatchingId: string;
  wellName: string;
  wellboreName: string;
  wellboreColor: string;
  rkbLevel: WellboreInternal['datum'];
}

export interface WellboreStickChartData {
  rigNames?: string[];
  formationsData: DataWithLoadingStatus<WellTopSurfaceView[]>;
  casingsData: DataWithLoadingStatus<CasingAssemblyView[]>;
  nptData: DataWithLoadingStatus<NptInternalWithTvd[]>;
  ndsData: DataWithLoadingStatus<NdsInternalWithTvd[]>;
  trajectoryData: DataWithLoadingStatus<TrajectoryWithData>;
  measurementsData: DataWithLoadingStatus<DepthMeasurementWithData[]>;
  holeSectionsData: DataWithLoadingStatus<HoleSectionView[]>;
  mudWeightData: DataWithLoadingStatus<DepthMeasurementWithData[]>;
  kickoffDepth: DataWithLoadingStatus<KickoffDepth>;
  drillingDays?: DataWithLoadingStatus<DrillingDays>;
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
}

export interface HoleSectionView extends HoleSectionInternalWithTvd {
  wellboreMatchingId: string;
  depthUnit: Distance;
  sizeUnit: Distance;
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
  HoleSection = 'Hole Section',
  // DrillingParameters = 'Drilling Parameters',
  MudWeight = 'Mud Weight',
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

export interface MudWeightData {
  id: string;
  type: string;
  depth: number;
  minMudDensity?: number;
  maxMudDensity?: number;
  depthUnit: string;
  densityUnit: string;
}

export interface MudWeightSummary {
  id: string;
  type: string;
  mudDensityRange: {
    min?: number;
    max?: number;
    unit: string;
  };
}

export type EventType = typeof EVENT_TYPES[number];
