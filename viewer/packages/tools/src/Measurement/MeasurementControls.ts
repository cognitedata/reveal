/*!
 * Copyright 2022 Cognite AS
 */

import { Cognite3DViewer, Intersection } from '@reveal/core';
import * as THREE from 'three';
import { MeasurementGizmo } from './MeasurementGizmo';
import { MeasurementLabel } from './MeasurementLabel';
import { Measurement } from './Measurement';
import { MeasurementLineOptions } from './types';
import { MeasurementDistance } from './MeasurementDistance';

export class MeasurementControls {
  private readonly _viewer: Cognite3DViewer;
  private readonly _measurementGizmo: MeasurementGizmo;
  private readonly _measurementLabel: MeasurementLabel;
  private readonly _startPosition: THREE.Vector3;
  private _measurement: Measurement;
  private _pointSize: number;

  private readonly _handleonPointerClick = this.onPointerClick.bind(this);
  private readonly _handleonPointerMove = this.onPointerMove.bind(this);

  constructor(viewer: Cognite3DViewer) {
    this._viewer = viewer;
    this._measurementGizmo = new MeasurementGizmo(this._viewer);
    this._measurementLabel = new MeasurementLabel(this._viewer);
    this._startPosition = new THREE.Vector3();
    this._pointSize = 0.02;
  }

  /**
   * Set input handling
   */
  private setupEventHandling() {
    this._viewer.on('click', this._handleonPointerClick);
  }

  /**
   * Remove input handling
   */
  private removeEventHandling() {
    this._viewer.off('click', this._handleonPointerClick);
  }

  /**
   * Add an measurement to the control
   * @param measurement Measurement object which is the active measurement type
   */
  add(measurement: Measurement): void {
    if (this._measurement) {
      this.remove();
    }
    this._measurement = measurement;
    this.setupEventHandling();
  }

  /**
   * Remove measurement from control
   */
  remove(): void {
    if (this._measurement) {
      this._measurement = null;
      this.removeEventHandling();
    }
  }

  private async onPointerClick(event: MouseEvent) {
    const { offsetX, offsetY } = event;

    const intersection = await this._viewer.getIntersectionFromPixel(offsetX, offsetY);

    if (intersection) {
      this._measurementGizmo.add(intersection.point, this._pointSize);

      if (!this._measurement.isActive()) {
        this.startMeasurement(intersection);
      } else {
        this.endMeasurement(intersection.point);
      }
      this._viewer.requestRedraw();
    }
  }

  private startMeasurement(intersection: Intersection) {
    this._viewer.domElement.addEventListener('mousemove', this._handleonPointerMove);
    this._startPosition.copy(intersection.point);
    this._measurement.start(intersection.point);
    this._measurement.assignDistanceStartPointToCamera(intersection.distanceToCamera);
  }

  private endMeasurement(point: THREE.Vector3) {
    this.updateMeasurement(0, 0, point);
    this._measurement.end();

    const labelPosition = this.calculateMidpoint(this._startPosition, point);
    const distanceValue = this._measurement.getMeasurementValue().toFixed(2).toString() + ' m';
    this._measurementLabel.add(labelPosition, distanceValue);
    this._viewer.domElement.removeEventListener('mousemove', this._handleonPointerMove);
  }

  private onPointerMove(event: MouseEvent) {
    const { offsetX, offsetY } = event;
    this.updateMeasurement(offsetX, offsetY);
    this._viewer.requestRedraw();
  }

  private calculateMidpoint(startPoint: THREE.Vector3, endPoint: THREE.Vector3): THREE.Vector3 {
    let direction = endPoint.clone().sub(startPoint);
    const length = direction.length();
    direction = direction.normalize().multiplyScalar(length * 0.5);

    return startPoint.clone().add(direction);
  }

  private updateMeasurement(offsetX: number, offsetY: number, endPoint?: THREE.Vector3): void {
    this._measurement.update(offsetX, offsetY, endPoint);
  }

  /**
   * Update the Measurement Line width & color
   * @param options Line Options of width & color
   */
  updateLineOptions(options: MeasurementLineOptions): void {
    if (this._measurement) {
      if (this._measurement instanceof MeasurementDistance) {
        this._measurement.setLineOptions(options);
        this._pointSize = options?.lineWidth || this._pointSize;
      }
    }
  }

  /**
   * Dispose Measurement control
   */
  dispose(): void {
    this.remove();
  }
}
