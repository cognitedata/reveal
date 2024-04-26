/*!
 * Copyright 2022 Cognite AS
 */

import type { Vector3, Color } from 'three';

export type Measurement = {
  readonly measurementId: number;
  readonly startPoint: Vector3;
  readonly endPoint: Vector3;
  readonly distanceInMeters: number;
};

/**
 * Custom callback for users to change measurement label content.
 */
export type DistanceToLabelDelegate = (distanceInMeters: number) => string;

/**
 * Delegate for measurement added events.
 */
export type MeasurementAddedDelegate = (measurement: Measurement) => void;

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
  color?: Color;
};
