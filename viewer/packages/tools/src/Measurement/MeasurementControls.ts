/*!
 * Copyright 2022 Cognite AS
 */

import { Cognite3DViewer } from '@reveal/core';
import { InputHandler } from '@reveal/utilities';
import * as THREE from 'three';
import { MeasurementGizmo } from './MeasurementGizmo';
import { MeasurementDistance } from './MeasurementDistance';
import { MeasurementLabel } from './MeaurementLabel';

export class MeasurementControls {
  private readonly _domElement: HTMLElement;
  private readonly _viewer: Cognite3DViewer;
  private readonly _inputHandler: InputHandler;
  private readonly _measurementGizmo: MeasurementGizmo;
  private readonly _measurementDistance: MeasurementDistance;
  private readonly _measurementLabel: MeasurementLabel;
  private readonly _startPosition: THREE.Vector3;

  private readonly _handleonPointerClick = this.onPointerClick.bind(this);
  private readonly _handleonPointerMove = this.onPointerMove.bind(this);

  constructor(viewer: Cognite3DViewer) {
    this._viewer = viewer;
    this._domElement = viewer.domElement;
    this._inputHandler = viewer.inputHandler;
    this._measurementGizmo = new MeasurementGizmo(this._viewer);
    this._measurementDistance = new MeasurementDistance(this._viewer);
    this._measurementLabel = new MeasurementLabel(this._viewer);
    this._startPosition = new THREE.Vector3();

    this.setupInputHandling();
  }

  private setupInputHandling() {
    this._inputHandler.on('click', this._handleonPointerClick);
  }

  private removeInputHandling() {
    this._domElement.removeEventListener('click', this._handleonPointerClick);
  }

  private async onPointerClick(event: MouseEvent) {
    const { offsetX, offsetY } = event;
    const pointer = new THREE.Vector2(offsetX, offsetY);

    const intersection = await this._viewer.getIntersectionFromPixel(pointer.x, pointer.y);

    if (intersection) {
      this._measurementGizmo.add(intersection.point);

      if (!this._measurementDistance.isActive()) {
        this._domElement.addEventListener('mousemove', this._handleonPointerMove);
        this._startPosition.copy(intersection.point);
        this._measurementDistance.addLine(intersection.point);
        const texture = this._measurementLabel.getOverlayTexture('0 m', 64);
        this._measurementLabel.addLabel(intersection.point, texture);
      } else {
        this.updateMeasurement(intersection.point);
        this._measurementDistance.completeLine();
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
    this._measurementDistance.update(point);
    const distanceValue = this._measurementDistance.getDistance().toFixed(3).toString() + ' m';
    const texture = this._measurementLabel.getOverlayTexture(distanceValue, 64);
    this._measurementLabel.updateLabelTexture(texture);
    this._measurementLabel.updateLabelPosition(this._startPosition, point);
  }

  public dispose(): void {
    this.removeInputHandling();
  }
}
