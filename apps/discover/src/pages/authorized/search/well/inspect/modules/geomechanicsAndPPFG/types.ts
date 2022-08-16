import {
  DepthMeasurementDataColumnInternal,
  DepthMeasurementWithData,
} from 'domain/wells/measurements/internal/types';

import { PlotData } from 'plotly.js';

import { DepthMeasurementUnit, PressureUnit } from 'constants/units';

export interface MeasurementsView extends DepthMeasurementWithData {
  wellName: string;
  wellboreName: string;
  wellboreColor: string;
  columns: MeasurementsViewColumn[];
}

export interface MeasurementsViewColumn
  extends DepthMeasurementDataColumnInternal {
  measurementTypeParent?: MeasurementType;
  isAngle: boolean;
}

export interface MeasurementCurveData extends Partial<PlotData> {
  id: string;
  columnExternalId: string;
  wellboreName: string;
  curveName: string;
  measurementType: MeasurementType;
}

export enum ViewModes {
  Wells = 'Wells',
  Curves = 'Curves',
}

export enum MeasurementType {
  GEOMECHANNICS = 'Geomechanics',
  PPFG = 'PPFG',
  FIT = 'FIT',
  LOT = 'LOT',
}

export enum CurvesFilterType {
  GEOMECHANNICS = 'Geomechanics curves',
  PPFG = 'PPFG curves',
  OTHER = 'Other curves',
}

export enum UnitSelectorType {
  PRESSURE = 'Pressure unit',
}

export type MeasurementCurveConfig = Record<
  MeasurementType,
  Record<string, Partial<PlotData>>
>;

export interface MeasurementUnits {
  pressureUnit: PressureUnit;
  depthMeasurementType: DepthMeasurementUnit;
  depthUnit: convert.Distance;
}
