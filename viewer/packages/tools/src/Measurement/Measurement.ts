/*!
 * Copyright 2022 Cognite AS
 */

export interface Measurement {
  /**
   * Add a measurement
   * @param point Start point of the Measurement
   */
  add(point: THREE.Vector3): void;
  /**
   * Remove a measurement
   */
  remove(): void;
  /**
   * Update the measurement
   * @param x screen X Position
   * @param y screen Y Position
   */
  update(x: number, y: number): void;
  /**
   * Complete the measurement calculation
   */
  complete(): void;
  /**
   * Is the measurement active or inactive
   */
  isActive(): boolean;
  /**
   * Get respective measurement value such as distance/angle/thickness
   */
  getMeasurementValue(): number;

  /**
   * Get the end point if exists
   */
  getEndPoint(): THREE.Vector3;

  /**
   * Set Camera distance from startPoint
   */
  setCameraDistance(cameraDistance: number): void;
}
