/*!
 * Copyright 2022 Cognite AS
 */

import { Cognite3DViewer } from '@reveal/core';
import * as THREE from 'three';
import { MeasurementGizmo } from './MeasurementGizmo';
import { MeasurementLabel } from './MeasurementLabel';
import { Measurement } from './Measurement';
import { MeasurementLineOptions } from './types';
import { MeasurementDistance } from './MeasurementDistance';

export class MeasurementControls {
  private readonly _domElement: HTMLElement;
  private readonly _viewer: Cognite3DViewer;
  private readonly _measurementGizmo: MeasurementGizmo;
  private readonly _measurementLabel: MeasurementLabel;
  private readonly _startPosition: THREE.Vector3;
  private _measurement: Measurement;
  private _isCameraChanged: boolean;
  private _pointSize: number;

  private readonly _handleonPointerClick = this.onPointerClick.bind(this);
  private readonly _handleonPointerMove = this.onPointerMove.bind(this);
  private readonly _handleonCameraChanged = this.onCameraChanged.bind(this);

  constructor(viewer: Cognite3DViewer) {
    this._viewer = viewer;
    this._domElement = viewer.domElement;
    this._measurementGizmo = new MeasurementGizmo(this._viewer);
    this._measurementLabel = new MeasurementLabel(this._viewer);
    this._startPosition = new THREE.Vector3();
    this._isCameraChanged = false;
    this._pointSize = 0.02;
  }

  /**
   * Set input handling
   */
  private setupEventHandling() {
    this._viewer.on('click', this._handleonPointerClick);
    this._viewer.on('cameraChange', this._handleonCameraChanged);
  }

  /**
   * Remove input handling
   */
  private removeEventHandling() {
    this._viewer.off('click', this._handleonPointerClick);
    this._viewer.off('cameraChange', this._handleonCameraChanged);
  }

  private onCameraChanged() {
    this._isCameraChanged = true;
  }

  /**
   * Add an measurement to the control
   * @param measurement Measurement object which is the active measurement type
   */
  public add(measurement: Measurement): void {
    this._measurement = measurement;
    this.setupEventHandling();
  }

  /**
   * Remove measurement from control
   */
  public remove(): void {
    if (this._measurement) {
      this._measurement.remove();
      this._measurement = null;
      this.removeEventHandling();
    }
  }

  private async onPointerClick(event: MouseEvent) {
    const { offsetX, offsetY } = event;
    const pointer = new THREE.Vector2(offsetX, offsetY);

    const intersection = await this._viewer.getIntersectionFromPixel(pointer.x, pointer.y);

    if (intersection) {
      this._measurementGizmo.add(intersection.point, this._pointSize);

      if (!this._measurement.isActive()) {
        this._domElement.addEventListener('mousemove', this._handleonPointerMove);
        this._startPosition.copy(intersection.point);
        this._measurement.add(intersection.point);
        this._measurementLabel.add(intersection.point);
      } else {
        this.updateMeasurement(intersection.point);
        this._measurement.complete();
        this._domElement.removeEventListener('mousemove', this._handleonPointerMove);
        this._isCameraChanged = false;
      }
      this._viewer.requestRedraw();
    }
  }

  private async onPointerMove(event: MouseEvent) {
    const { offsetX, offsetY } = event;
    const pointer = new THREE.Vector2(offsetX, offsetY);

    const intersection = await this._viewer.getIntersectionPixelFromBuffer(pointer.x, pointer.y, this._isCameraChanged);

    if (intersection) {
      this.updateMeasurement(intersection);
      this._viewer.requestRedraw();
      this._isCameraChanged = false;
    }
  }

  private updateMeasurement(point: THREE.Vector3): void {
    this._measurement.update(point);
    const distanceValue = this._measurement.getMeasurementValue().toFixed(1).toString();
    this._measurementLabel.update(distanceValue, this._startPosition, point);
  }

  public updateLineOptions(options: MeasurementLineOptions): void {
    if (this._measurement) {
      const distanceMeasurement = this._measurement as MeasurementDistance;
      distanceMeasurement.setLineOptions(options);
      this._pointSize = options?.lineWidth || this._pointSize;
    }
  }

  public dispose(): void {
    this.removeEventHandling();
  }
}
