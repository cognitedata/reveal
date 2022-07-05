/*!
 * Copyright 2022 Cognite AS
 */

/**
 * Custom callback for users to change measurement label content.
 */
export type DistanceToLabelDelegate = (distanceInMeters: number) => string;

/**
 * Measurement tool option with user custom callback, line width & color.
 */
export type MeasurementOptions = {
  distanceToLabelCallback?: DistanceToLabelDelegate | undefined;
  /**
   * Line width in cm. Note that the minium drawn line will be ~2 pixels.
   */
  lineWidth?: number;
  /**
   * Line color in 32 bit hex.
   */
  color?: number;
};
