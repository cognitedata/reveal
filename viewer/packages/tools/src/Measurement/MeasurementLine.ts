/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { MeasurementLineOptions } from './types';

export class MeasurementLine {
  private _geometry: LineGeometry | null;
  private _material: LineMaterial | null;
  private _position: Float32Array;
  private _axisDistance: THREE.Vector3;
  private _xAxisMidPoint: THREE.Vector3;
  private _yAxisMidPoint: THREE.Vector3;
  private _zAxisMidPoint: THREE.Vector3;
  private _distanceToCamera: number = 0;

  private readonly _options: MeasurementLineOptions = {
    lineWidth: 0.01,
    color: 0x00ffff
  };

  constructor() {
    this._position = new Float32Array(6);
    this._axisDistance = new THREE.Vector3();
    this._xAxisMidPoint = new THREE.Vector3();
    this._yAxisMidPoint = new THREE.Vector3();
    this._zAxisMidPoint = new THREE.Vector3();
    this._geometry = null;
    this._material = null;
  }

  /**
   * Generating Line geometry and create the mesh.
   * @param point Point from where the line will be generated.
   * @param distanceToCamera Distance to camera from the @point
   */
  startLine(point: THREE.Vector3, distanceToCamera: number): THREE.Mesh {
    this._position[0] = this._position[3] = point.x;
    this._position[1] = this._position[4] = point.y;
    this._position[2] = this._position[5] = point.z;

    this._distanceToCamera = distanceToCamera;

    this._geometry = new LineGeometry();
    this._geometry.setPositions(this._position);

    this._material = new LineMaterial({
      color: this._options.color,
      linewidth: this._options.lineWidth,
      depthTest: false,
      worldUnits: true,
      dashed: true,
      transparent: true,
      opacity: 1
    });

    const mesh = new THREE.Mesh(this._geometry as THREE.BufferGeometry, this._material);
    //Make sure line are rendered in-front of other objects
    mesh.renderOrder = 1;

    return mesh;
  }

  /**
   * Update the measuring line end point.
   * @param offsetX X Coordinate of the mouse pointer.
   * @param offsetY Y Coordinate of the mouse pointer.
   * @param domElement HTML canvas element.
   * @param camera Reveal camera.
   * @param endPoint Second point of the line to end the measurement.
   */
  updateLine(
    offsetX: number,
    offsetY: number,
    domElement: HTMLElement,
    camera: THREE.Camera,
    endPoint?: THREE.Vector3
  ): void {
    const position = new THREE.Vector3();
    //Check if measurement is ended.
    if (endPoint) {
      position.copy(endPoint);
      this._material?.color.set(new THREE.Color(this._options.color));
      this._material?.setValues({ opacity: 1.0 });
    } else {
      //Get position based on the mouse pointer X and Y value.
      const mouse = new THREE.Vector2();
      mouse.x = (offsetX / domElement.clientWidth) * 2 - 1;
      mouse.y = -(offsetY / domElement.clientHeight) * 2 + 1;

      const direction = new THREE.Vector3();
      const ray = new THREE.Ray();
      const origin = new THREE.Vector3();

      //Set the origin of the Ray to camera.
      origin.setFromMatrixPosition(camera.matrixWorld);
      ray.origin.copy(origin);
      //Calculate the camera direction.
      direction.set(mouse.x, mouse.y, 0.5).unproject(camera).sub(ray.origin).normalize();
      ray.direction.copy(direction);
      //Note: Using the initial/start point as reference for ray to emit till that distance from camera.
      ray.at(this._distanceToCamera, position);
      //Add transparent color when dragging to make other 3D objects visible for users
      this._material?.color.set(new THREE.Color(this._options.color));
      this._material?.setValues({ opacity: 0.2 });
    }

    this._position[3] = position.x;
    this._position[4] = position.y;
    this._position[5] = position.z;
    //Update the line geometry end point.
    this._geometry?.setPositions(this._position);
  }

  /**
   * Sets Measurement line width and color with @options value.
   * @param options MeasurementLineOptions to set line width and color.
   */
  setOptions(options: MeasurementLineOptions): void {
    this._options.lineWidth = options?.lineWidth ?? this._options.lineWidth;
    this._options.color = options?.color ?? this._options.color;
    //Apply for current active line if set
    if (this._material && options.currentLine) {
      this._material?.setValues({ linewidth: this._options.lineWidth });
      this._material?.color.set(new THREE.Color(this._options.color));
    }
  }

  /**
   * Get the distance between the measuring line start point & end point.
   * @returns Return distance between start & end point of the line.
   */
  getMeasuredDistance(): number {
    const startPoint = new THREE.Vector3(this._position[0], this._position[1], this._position[2]);
    const endPoint = new THREE.Vector3(this._position[3], this._position[4], this._position[5]);
    return endPoint.distanceTo(startPoint);
  }

  /**
   * Calculate mid point betwen in the Line.
   * @returns Returns mid point between two points.
   */
  getMidPointOnLine(): THREE.Vector3 {
    const startPoint = new THREE.Vector3(this._position[0], this._position[1], this._position[2]);
    const endPoint = new THREE.Vector3(this._position[3], this._position[4], this._position[5]);
    let direction = endPoint.clone().sub(startPoint);
    const length = direction.length();
    direction = direction.normalize().multiplyScalar(length * 0.5);

    return startPoint.clone().add(direction);
  }

  /**
   * Clear all line objects mesh, geometry & material.
   */
  clearObjects(): void {
    if (this._geometry) {
      this._geometry.dispose();
      this._geometry = null;
    }
    if (this._material) {
      this._material.dispose();
      this._material = null;
    }
  }

  /**
   * Create X, Y, Z axis line distance meshes.
   * @returns Returns axis line mesh.
   */
  getAxisLines(): THREE.Mesh[] {
    this._axisDistance.y = this._position[0] - this._position[3];
    this._axisDistance.x = this._position[1] - this._position[4];
    this._axisDistance.z = this._position[2] - this._position[5];

    //Vertical distance line
    let yAxisLinePosition = new Float32Array(6);
    yAxisLinePosition = this._position.slice();
    yAxisLinePosition[3] += this._axisDistance.y;
    yAxisLinePosition[5] += this._axisDistance.z;
    const verticalLine = this.addLine(yAxisLinePosition, 0x00ff00);
    this._yAxisMidPoint = this.setAxisMidPosition(yAxisLinePosition);

    //Horizontal distance line
    const xAxisLinePosition = new Float32Array(6);
    xAxisLinePosition.set(yAxisLinePosition.slice(3, 6), 0);
    xAxisLinePosition[3] = yAxisLinePosition[3];
    xAxisLinePosition[4] = yAxisLinePosition[4];
    xAxisLinePosition[5] = yAxisLinePosition[5] - this._axisDistance.z;
    const horizontalLine = this.addLine(xAxisLinePosition, 0xff0000);
    this._xAxisMidPoint = this.setAxisMidPosition(xAxisLinePosition);

    //Depth distance line
    const zAxisLinePosition = new Float32Array(6);
    zAxisLinePosition[4] += this._axisDistance.y;
    zAxisLinePosition.set(xAxisLinePosition.slice(3, 6), 0);
    zAxisLinePosition[3] = xAxisLinePosition[3] - this._axisDistance.y;
    zAxisLinePosition[4] = xAxisLinePosition[4];
    zAxisLinePosition[5] = xAxisLinePosition[5];
    const depthLine = this.addLine(zAxisLinePosition, 0x0000ff);
    this._zAxisMidPoint = this.setAxisMidPosition(zAxisLinePosition);

    return [verticalLine, horizontalLine, depthLine];
  }

  getAxisDistances(): THREE.Vector3 {
    return this._axisDistance;
  }

  getAxisMidPoints(): THREE.Vector3[] {
    return [this._yAxisMidPoint, this._zAxisMidPoint, this._xAxisMidPoint];
  }

  private addLine(position: Float32Array, color: number): THREE.Mesh {
    const axesLine = new LineGeometry();
    axesLine.setPositions(position);
    const axesLineMaterial = new LineMaterial({
      color: color,
      linewidth: this._options.lineWidth! / 2,
      depthTest: false,
      worldUnits: true
    });
    const axesLineMesh = new THREE.Mesh(axesLine, axesLineMaterial);
    axesLineMesh.renderOrder = 1;

    return axesLineMesh;
  }

  private setAxisMidPosition(position: Float32Array): THREE.Vector3 {
    const tempPosition = this._position;
    this._position = position;
    const midPoint = this.getMidPointOnLine();
    this._position = tempPosition;

    return midPoint;
  }
}
