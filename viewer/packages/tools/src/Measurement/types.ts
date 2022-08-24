/*!
 * Copyright 2022 Cognite AS
 */

/**
 * Custom callback for users to change measurement label content.
 */
export type DistanceToLabelDelegate = (distanceInMeters: number) => string;

/**
 * Delegate for measurement added events.
 */
export type MeasurementAddedDelegate = (event: {
  measurementId: number;
  startPoint: THREE.Vector3;
  endPoint: THREE.Vector3;
  distanceInMeters: number;
}) => void;

/**
 * Delegate for measurement started events.
 */
export type MeasurementStartedDelegate = () => void;

/**
 * Delegate for measurement ended events.
 */
export type MeasurementEndedDelegate = () => void;

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
  color?: THREE.Color;
};
