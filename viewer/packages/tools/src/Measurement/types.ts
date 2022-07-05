/*!
 * Copyright 2022 Cognite AS
 */

/**
 * Custom callback for users to change measurement label content.
 */
export type DistanceToLabelDelegate = (distanceInMeters: number) => string;

/**
 * Measurment tool option with user custom callback, line width & color.
 */
export type MeasurementOptions = {
  distanceToLabelCallback?: DistanceToLabelDelegate | undefined;
  lineWidth?: number;
  color?: number;
};
