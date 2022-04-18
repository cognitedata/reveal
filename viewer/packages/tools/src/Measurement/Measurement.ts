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
   * @param controlPoint control or second point for the measurement
   */
  update(controlPoint: THREE.Vector3): void;
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
}
