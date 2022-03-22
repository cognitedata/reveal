/*!
 * Copyright 2022 Cognite AS
 */

import { Cognite3DViewer } from '@reveal/core';
import * as THREE from 'three';
import { Vector3 } from 'three';

export class MeasurementDistance {
  private readonly _viewer: Cognite3DViewer;
  private _measurementLine: THREE.Line | undefined;
  private _lineGeometry: THREE.BufferGeometry;
  private _isActive: boolean;
  private readonly _startPoint: THREE.Vector3;
  private readonly _endPoint: THREE.Vector3;

  constructor(viewer: Cognite3DViewer) {
    this._viewer = viewer;
    this._isActive = false;
    this._startPoint = new THREE.Vector3();
    this._endPoint = new THREE.Vector3();
  }

  private initializeLine(): void {
    if (this._measurementLine === undefined) {
      const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
      this._lineGeometry = new THREE.BufferGeometry().setFromPoints([this._startPoint, this._endPoint]);

      this._measurementLine = new THREE.Line(this._lineGeometry, material);

      this._viewer.addObject3D(this._measurementLine);
    }
  }

  public addLine(point: THREE.Vector3): void {
    this.initializeLine();
    this.addStartPoint(point);
  }

  private clearLine(): void {
    if (this._measurementLine) {
      this._measurementLine.geometry.dispose();
      this._measurementLine.clear();
      this._measurementLine = undefined;
      this._isActive = false;
    }
  }

  public completeLine(): void {
    this.clearLine();
  }

  private addStartPoint(point: THREE.Vector3): void {
    this._startPoint.copy(point);
    this._isActive = true;
  }

  public getDistance(): number {
    return this._endPoint.distanceTo(this._startPoint);
  }

  public update(controlPoint: THREE.Vector3): void {
    if (this._isActive && this._measurementLine) {
      controlPoint.addScalar(0.0001);
      this._measurementLine.geometry.setFromPoints([this._startPoint, controlPoint]);
      this._endPoint.copy(controlPoint);
    }
  }

  public isActive(): boolean {
    return this._isActive;
  }
}
