import { WellboreInternal } from 'domain/wells/wellbore/internal/types';

import { Angle, Distance } from 'convert-units';

import {
  DoglegSeverity,
  DoglegSeverityUnit,
  Trajectory,
  TrajectoryData,
  TrueVerticalDepths,
} from '@cognite/sdk-wells-v3';

export interface TrajectoryInternal
  extends Omit<Trajectory, 'maxDoglegSeverity'> {
  maxDoglegSeverity: DoglegSeverityInternal;
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
