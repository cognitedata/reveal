/*!
 * Copyright 2022 Cognite AS
 */

export interface Measurement {
  /**
   * Add a measurement
   * @param point point for the Measurement
   */
  start(point: THREE.Vector3): void;
  /**
   * Update the measurement at Mouse X & Y or at a point
   * @param x mouse X position
   * @param y mouse Y position
   * @param point start point
   */
  update(x?: number, y?: number, point?: THREE.Vector3): void;
  /**
   * Complete the measurement
   */
  end(): void;
  /**
   * Is the measurement active
   */
  isActive(): boolean;
  /**
   * Get respective measurement value such as distance/angle/thickness
   */
  getMeasurementValue(): number;
  /**
   * Assign distance of Camera distance to start point
   * @param distance Camera distance to Start Point
   */
  assignDistanceStartPointToCamera(distance: number): void;
}
