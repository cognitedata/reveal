/*!
 * Copyright 2022 Cognite AS
 */

export type MeasurementLineOptions = {
  lineWidth?: number;
  color?: number;
};

export type MeasurementUnitUpdateDelegate = () => MeasurementUnits;

export type MeasurementOptions = {
  unitsUpdateCallback?: MeasurementUnitUpdateDelegate;
};

export enum MeasurementUnits {
  Meter = 'meter',
  Feet = 'feet',
  Inches = 'inches',
  Centimeter = 'centimeter'
}
