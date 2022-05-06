/*!
 * Copyright 2022 Cognite AS
 */

import { Cognite3DViewer } from '@reveal/core';
import * as THREE from 'three';
import { LineGeometry } from './LineGeometry';
import { lineShaders } from '@reveal/rendering';
import { Line } from './Line';
import { Measurement } from './Measurement';
import { MeasurementLineOptions } from './types';

export class MeasurementDistance implements Measurement {
  private readonly _viewer: Cognite3DViewer;
  private _measurementLine: Line | undefined;
  private _lineGeometry: LineGeometry;
  private _isActive: boolean;
  private readonly _startPoint: THREE.Vector3;
  private readonly _endPoint: THREE.Vector3;
  private _positions: Float32Array;
  private _lineOptions: MeasurementLineOptions = {
    lineWidth: 0.02,
    color: new THREE.Color(0x00ffff)
  };
  private readonly _raycaster: THREE.Raycaster;
  private _cameraDistance: number;

  private readonly LineUniforms: any = {
    linewidth: { value: this._lineOptions.lineWidth },
    resolution: { value: new THREE.Vector2(1, 1) },
    color: { value: this._lineOptions.color }
  };

  private readonly ShaderUniforms: any = {
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.common, THREE.UniformsLib.fog, this.LineUniforms])
  };

  constructor(viewer: Cognite3DViewer, lineOptions?: MeasurementLineOptions) {
    this._viewer = viewer;
    this._isActive = false;
    this._startPoint = new THREE.Vector3();
    this._endPoint = new THREE.Vector3();
    this._positions = new Float32Array(6);
    this._lineOptions = lineOptions ?? this._lineOptions;
    this._raycaster = new THREE.Raycaster();
    this._cameraDistance = 0;
  }

  private initializeLine(): void {
    if (this._measurementLine === undefined) {
      this._lineGeometry = new LineGeometry();
      const lineMaterial = new THREE.RawShaderMaterial({
        uniforms: THREE.UniformsUtils.clone(this.ShaderUniforms.uniforms),
        vertexShader: lineShaders.vertex,
        fragmentShader: lineShaders.fragment,
        clipping: true,
        glslVersion: THREE.GLSL3
      });

      this._positions[0] = this._positions[1] = this._positions[2] = 0;
      this._positions[3] = this._positions[4] = this._positions[5] = 0;

      this._lineGeometry.setPositions(this._positions);

      this._measurementLine = new Line(this._lineGeometry, lineMaterial);

      this._viewer.addObject3D(this._measurementLine);
    }
  }

  /**
   * Add/Start the line of the distance measurement
   * @param point Start point of the Line
   */
  add(point: THREE.Vector3): void {
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

  /**
   * Remove the measurement line
   */
  remove(): void {
    this.clearLine();
  }

  /**
   * Completes a line for distance measurement
   */
  complete(): void {
    this.clearLine();
  }

  private addStartPoint(point: THREE.Vector3): void {
    this._startPoint.copy(point);
    this._endPoint.copy(point);
    this._positions[0] = this._startPoint.x;
    this._positions[1] = this._startPoint.y;
    this._positions[2] = this._startPoint.z;
    this._isActive = true;
  }

  /**
   * Get the distance value between the start point & end/mouse point
   * @returns Distance between the two points
   */
  getMeasurementValue(): number {
    return this._endPoint.distanceTo(this._startPoint);
  }

  /**
   * Update the line
   * @param x Screen X Position
   * @param y Screen Y Position
   */
  update(x: number, y: number, endPoint?: THREE.Vector3): void {
    const position = new THREE.Vector3();
    if (endPoint) {
      position.copy(endPoint);
    } else {
      const mouse = new THREE.Vector2();
      mouse.x = (x / this._viewer.domElement.clientWidth) * 2 - 1;
      mouse.y = -(y / this._viewer.domElement.clientHeight) * 2 + 1;
      this._raycaster.setFromCamera(mouse, this._viewer.getCamera());

      this._raycaster.ray.at(this._cameraDistance, position);
    }

    this._positions[3] = position.x;
    this._positions[4] = position.y;
    this._positions[5] = position.z;
    this._lineGeometry.setPositions(this._positions);
    this._endPoint.copy(position);
  }

  /**
   * Check if the measurement is active
   * @returns Returns `true` if distance measurement is active
   */
  isActive(): boolean {
    return this._isActive;
  }

  /**
   * Get the end point
   * @returns End point
   */
  getEndPoint(): THREE.Vector3 {
    return this._endPoint;
  }

  /**
   * Sets the line width & color
   * @param options MeasurementLineOptions.lineWidth or MeasurementLineOptions.color or both
   */
  setLineOptions(options: MeasurementLineOptions): void {
    this.ShaderUniforms.uniforms.linewidth.value = options?.lineWidth ?? this._lineOptions.lineWidth;
    this.ShaderUniforms.uniforms.color.value = new THREE.Color(options?.color ?? this._lineOptions.color);
    this._lineOptions.color = this.ShaderUniforms.uniforms.color.value;
    this._lineOptions.lineWidth = this.ShaderUniforms.uniforms.linewidth.value;
  }

  /**
   * Set the distance from camera
   * @param cameraDistance distance from the camera to the startPoint
   */
  setCameraDistance(cameraDistance: number): void {
    this._cameraDistance = cameraDistance;
  }
}
