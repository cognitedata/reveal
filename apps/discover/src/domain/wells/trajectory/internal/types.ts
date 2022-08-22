import { WellboreInternal } from 'domain/wells/wellbore/internal/types';

import { Angle, Distance } from 'convert-units';
import { Datum, PlotData } from 'plotly.js';

import { ProjectConfigWellsTrajectoryCharts } from '@cognite/discover-api-types';
import {
  DoglegSeverity,
  DoglegSeverityUnit,
  Trajectory,
  TrajectoryData,
  TrueVerticalDepths,
} from '@cognite/sdk-wells';

import { Errors } from 'modules/inspectTabs/types';

import {
  TRAJECTORY_CHART_PLANES,
  TRAJECTORY_COLUMN_NAME_MAP,
} from '../constants';

export interface TrajectoryInternal
  extends Omit<
    Trajectory,
    'maxMeasuredDepth' | 'maxTrueVerticalDepth' | 'maxDoglegSeverity'
  > {
  maxDoglegSeverity: DoglegSeverityInternal;
  maxMeasuredDepth?: number;
  maxTrueVerticalDepth?: number;
}

export interface TrajectoryDataInternal
  extends Omit<
    TrajectoryData,
    | 'measuredDepthUnit'
    | 'inclinationUnit'
    | 'azimuthUnit'
    | 'trueVerticalDepthUnit'
    | 'equivalentDepartureUnit'
    | 'offsetUnit'
    | 'doglegSeverityUnit'
  > {
  measuredDepthUnit: Distance;
  inclinationUnit: Angle;
  azimuthUnit: Angle;
  trueVerticalDepthUnit: Distance;
  equivalentDepartureUnit: Distance;
  offsetUnit: Distance;
  doglegSeverityUnit: DoglegSeverityUnitInternal;
}

export type TrajectoryWithData = TrajectoryInternal & TrajectoryDataInternal;

export interface DoglegSeverityInternal extends Omit<DoglegSeverity, 'unit'> {
  unit: DoglegSeverityUnitInternal;
}
export interface DoglegSeverityUnitInternal
  extends Omit<DoglegSeverityUnit, 'angleUnit' | 'distanceUnit'> {
  angleUnit: Angle;
  distanceUnit: Distance;
}

export interface TrueVerticalDepthsDataLayer extends TrueVerticalDepths {
  mdTvdMap: Record<number, number>;
}

export type KeyedTvdData = Record<
  WellboreInternal['matchingId'],
  TrueVerticalDepthsDataLayer
>;

export type GroupedTvdData = Record<
  WellboreInternal['matchingId'],
  TrueVerticalDepthsDataLayer[]
>;

export interface TrajectoryChartDataList {
  data: Array<Partial<PlotData>[]>;
  errors: Errors;
}

export type TrajectoryChartDataAccessor =
  keyof typeof TRAJECTORY_COLUMN_NAME_MAP;

export type TrajectoryChartPlane = typeof TRAJECTORY_CHART_PLANES[number];

export type TrajectoryCurveCoordinates = Record<TrajectoryChartPlane, Datum[]>;

export interface TrajectoryCurveFormatterData<T> {
  trajectoryChart: ProjectConfigWellsTrajectoryCharts;
  trajectory: T;
}
