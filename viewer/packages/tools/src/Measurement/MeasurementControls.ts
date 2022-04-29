/*!
 * Copyright 2022 Cognite AS
 */

import { Cognite3DViewer } from '@reveal/core';
import { InputHandler } from '@reveal/utilities';
import * as THREE from 'three';
import { MeasurementGizmo } from './MeasurementGizmo';
import { MeasurementLabel } from './MeaurementLabel';
import { Measurement } from './Measurement';
import { MeasurementLabelOptions, MeasurementLineOptions } from './types';
import { MeasurementDistance } from './MeasurementDistance';

export class MeasurementControls {
  private readonly _domElement: HTMLElement;
  private readonly _viewer: Cognite3DViewer;
  private readonly _inputHandler: InputHandler;
  private readonly _measurementGizmo: MeasurementGizmo;
  private readonly _measurementLabel: MeasurementLabel;
  private readonly _startPosition: THREE.Vector3;
  private _measurement: Measurement;
  private readonly _labelOptions: MeasurementLabelOptions;

  private readonly _handleonPointerClick = this.onPointerClick.bind(this);
  private readonly _handleonPointerMove = this.onPointerMove.bind(this);

  constructor(viewer: Cognite3DViewer, labelOptions?: MeasurementLabelOptions) {
    this._viewer = viewer;
    this._domElement = viewer.domElement;
    this._inputHandler = viewer.inputHandler;
    this._measurementGizmo = new MeasurementGizmo(this._viewer);
    this._measurementLabel = new MeasurementLabel(this._viewer);
    this._startPosition = new THREE.Vector3();
    this._labelOptions = labelOptions ?? this._labelOptions;
  }

  /**
   * Set input handling
   */
  private setupInputHandling() {
    this._inputHandler.on('click', this._handleonPointerClick);
  }

  /**
   * Remove input handling
   */
  private removeInputHandling() {
    this._domElement.removeEventListener('click', this._handleonPointerClick);
  }

  /**
   * Add an measurement to the control
   * @param measurement Measurement object which is the active measurement type
   */
  public add(measurement: Measurement): void {
    this._measurement = measurement;
    this.setupInputHandling();
  }

  /**
   * Remove measurement from control
   */
  public remove(): void {
    if (this._measurement) {
      this._measurement.remove();
      this._measurement = null;
      this.removeInputHandling();
    }
  }

  private async onPointerClick(event: MouseEvent) {
    const { offsetX, offsetY } = event;
    const pointer = new THREE.Vector2(offsetX, offsetY);

    const intersection = await this._viewer.getIntersectionFromPixel(pointer.x, pointer.y);

    if (intersection) {
      this._measurementGizmo.add(intersection.point);

      if (!this._measurement.isActive()) {
        this._domElement.addEventListener('mousemove', this._handleonPointerMove);
        this._startPosition.copy(intersection.point);
        this._measurement.add(intersection.point);
        const texture = this._measurementLabel.getOverlayTexture('0');
        this._measurementLabel.addLabel(intersection.point, texture);
      } else {
        this.updateMeasurement(intersection.point);
        this._measurement.complete();
        this._domElement.removeEventListener('mousemove', this._handleonPointerMove);
      }
      this._viewer.requestRedraw();
    }
  }

  private async onPointerMove(event: MouseEvent) {
    const { offsetX, offsetY } = event;
    const pointer = new THREE.Vector2(offsetX, offsetY);

    const intersection = await this._viewer.getIntersectionPixelFromBuffer(pointer.x, pointer.y);

    if (intersection) {
      this.updateMeasurement(intersection);
      this._viewer.requestRedraw();
    }
  }

  private updateMeasurement(point: THREE.Vector3): void {
    this._measurement.update(point);
    const distanceValue = this._measurement.getMeasurementValue().toFixed(3).toString();
    const texture = this._measurementLabel.getOverlayTexture(distanceValue);
    this._measurementLabel.updateLabelTexture(texture);
    this._measurementLabel.updateLabelPosition(this._startPosition, point);
  }

  public updateLineOptions(options: MeasurementLineOptions): void {
    if (this._measurement) {
      const distanceMeasurement = this._measurement as MeasurementDistance;
      distanceMeasurement.setLineOptions(options);
    }
  }

  public dispose(): void {
    this.removeInputHandling();
  }
}
