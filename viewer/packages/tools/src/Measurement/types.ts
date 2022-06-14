/*!
 * Copyright 2022 Cognite AS
 */

/**
 * Custom callback for users to change measurement label content.
 */
export type MeasurementLabelUpdateDelegate = (distance: number) => MeasurementLabelData | undefined;

/**
 * Measurment tool option with user custom callback, line width & color.
 */
export type MeasurementOptions = {
  changeMeasurementLabelMetrics?: MeasurementLabelUpdateDelegate | undefined;
  lineWidth?: number;
  color?: number;
};

/**
 * Measurement data the user can change for the label.
 */
export type MeasurementLabelData = {
  distance?: number;
  units: string;
};
