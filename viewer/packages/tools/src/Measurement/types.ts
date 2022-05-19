/*!
 * Copyright 2022 Cognite AS
 */

export type MeasurementLineOptions = {
  lineWidth?: number;
  color?: number;
};

export type MeasurementLabelUpdateDelegate = (distance: number) => MeasurementData;

export type MeasurementOptions = {
  changeMeasurementLabelMetrics?: MeasurementLabelUpdateDelegate;
};

export type MeasurementData = {
  distance: number;
  units: string;
};
