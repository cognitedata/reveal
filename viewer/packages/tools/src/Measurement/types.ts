/*!
 * Copyright 2022 Cognite AS
 */

export type MeasurementLineOptions = {
  lineWidth?: number;
  color?: THREE.Color;
};

export type MeasurementUnitUpdateDelegate = () => MeasurementUnits;

export type MeasurementOptions = {
  unitsUpdateCallback?: MeasurementUnitUpdateDelegate;
};

export enum MeasurementUnits {
  Meters = 'meters',
  Feets = 'feets',
  Inches = 'inches',
  Centimeters = 'centimeters'
}
