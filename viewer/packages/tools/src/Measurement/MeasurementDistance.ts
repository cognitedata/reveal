/*!
 * Copyright 2022 Cognite AS
 */

import { Cognite3DViewer } from '@reveal/core';
import * as THREE from 'three';
import { LineGeometry } from './LineGeometry';
import { MeasurementLineOptions } from './types';
import glsl from 'glslify';

export class MeasurementDistance {
  private readonly _viewer: Cognite3DViewer;
  private _measurementLine: THREE.Mesh | undefined;
  private _lineGeometry: LineGeometry;
  private _isActive: boolean;
  private _positions: Float32Array;
  private readonly _raycaster: THREE.Raycaster;
  private _cameraDistanceFromStartPoint: number;

  private readonly lineShaders = {
    fragment: glsl(require('./shaders/line.frag').default),
    vertex: glsl(require('./shaders/line.vert').default)
  };

  private _lineOptions: MeasurementLineOptions = {
    lineWidth: 0.02,
    color: new THREE.Color(0x00ffff)
  };

  private readonly LineUniforms = {
    linewidth: { value: this._lineOptions.lineWidth },
    resolution: { value: new THREE.Vector2(1, 1) },
    color: { value: this._lineOptions.color },
    opacity: { value: 1.0 }
  };

  constructor(viewer: Cognite3DViewer, lineOptions?: MeasurementLineOptions) {
    this._viewer = viewer;
    this._isActive = false;
    this._positions = new Float32Array(6);
    this._lineOptions = lineOptions ?? this._lineOptions;
    this._raycaster = new THREE.Raycaster();
    this._cameraDistanceFromStartPoint = 0;
  }

  private initializeLine(): void {
    if (this._measurementLine === undefined) {
      this._lineGeometry = new LineGeometry();
      const lineMaterial = new THREE.RawShaderMaterial({
        uniforms: THREE.UniformsUtils.clone(this.LineUniforms),
        vertexShader: this.lineShaders.vertex,
        fragmentShader: this.lineShaders.fragment,
        clipping: true,
        glslVersion: THREE.GLSL3
      });

      this._positions[0] = this._positions[1] = this._positions[2] = 0;
      this._positions[3] = this._positions[4] = this._positions[5] = 0;

      this._lineGeometry.setPositions(this._positions);

      this._measurementLine = new THREE.Mesh(this._lineGeometry, lineMaterial);

      this._viewer.addObject3D(this._measurementLine);
    }
  }

  /**
   * Start the line of the distance measurement
   * @param point Start point of the Line
   */
  start(point: THREE.Vector3): void {
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
   * End the line for distance measurement
   */
  end(): void {
    this.clearLine();
  }

  private addStartPoint(point: THREE.Vector3): void {
    this._positions[0] = point.x;
    this._positions[1] = point.y;
    this._positions[2] = point.z;
    this._isActive = true;
  }

  /**
   * Get the distance value between the start point & end/mouse point
   * @returns Distance between the two points
   */
  getMeasurementValue(): number {
    const startPoint = new THREE.Vector3(this._positions[0], this._positions[1], this._positions[2]);
    const endPoint = new THREE.Vector3(this._positions[3], this._positions[4], this._positions[5]);
    return endPoint.distanceTo(startPoint);
  }

  /**
   * Update the line
   * @param x Screen X Position
   * @param y Screen Y Position
   */
  update(x?: number, y?: number, endPoint?: THREE.Vector3): void {
    const position = new THREE.Vector3();
    if (endPoint) {
      position.copy(endPoint);
    } else {
      const mouse = new THREE.Vector2();
      mouse.x = (x / this._viewer.domElement.clientWidth) * 2 - 1;
      mouse.y = -(y / this._viewer.domElement.clientHeight) * 2 + 1;
      this._raycaster.setFromCamera(mouse, this._viewer.getCamera());

      this._raycaster.ray.at(this._cameraDistanceFromStartPoint, position);
    }

    this._positions[3] = position.x;
    this._positions[4] = position.y;
    this._positions[5] = position.z;
    this._lineGeometry.setPositions(this._positions);
  }

  /**
   * Check if the measurement is active
   * @returns Returns `true` if distance measurement is active
   */
  isActive(): boolean {
    return this._isActive;
  }

  /**
   * Sets the line width & color
   * @param options MeasurementLineOptions.lineWidth or MeasurementLineOptions.color or both
   */
  setLineOptions(options: MeasurementLineOptions): void {
    this.LineUniforms.linewidth.value = options?.lineWidth ?? this._lineOptions.lineWidth;
    this.LineUniforms.color.value = new THREE.Color(options?.color ?? this._lineOptions.color);
    this._lineOptions.color = this.LineUniforms.color.value;
    this._lineOptions.lineWidth = this.LineUniforms.linewidth.value;
  }

  /**
   * Assign distance of Camera distance to start point
   * @param distance Camera distance to Start Point
   */
  assignDistanceStartPointToCamera(distance: number): void {
    this._cameraDistanceFromStartPoint = distance;
  }
}
