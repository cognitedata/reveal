import { DepthMeasurementWithData } from 'domain/wells/measurements/internal/types';

import { DepthMeasurementUnit, PressureUnit } from 'constants/units';

export interface MeasurementsView extends DepthMeasurementWithData {
  wellName: string;
  wellboreName: string;
  wellboreColor: string;
}

export enum ViewModes {
  Wells = 'Wells',
  Curves = 'Curves',
}

export enum CurvesFilterType {
  GEOMECHANNICS = 'Geomechanics curves',
  PPFG = 'PPFG curves',
  OTHER = 'Other curves',
}

export enum UnitSelectorType {
  PRESSURE = 'Pressure unit',
}

export interface MeasurementUnits {
  pressureUnit: PressureUnit;
  depthMeasurementType: DepthMeasurementUnit;
  depthUnit: convert.Distance;
}

export type WellWellboreSelection = Record<string, string[]>;
