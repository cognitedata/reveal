/*!
 * Copyright 2022 Cognite AS
 */

/**
 * Measurment line options of width & color which can be used while creating Measurement tool.
 */
export type MeasurementLineOptions = {
  lineWidth?: number;
  color?: number;
};

/**
 * Custom callback for users to change measurement label content.
 */
export type MeasurementLabelUpdateDelegate = (distance: number) => MeasurementData;

export type MeasurementOptions = {
  changeMeasurementLabelMetrics?: MeasurementLabelUpdateDelegate;
};

/**
 * Measurement data the user can change for the label.
 */
export type MeasurementData = {
  distance: number;
  units: string;
};
