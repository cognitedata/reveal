/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { MeasurementOptions } from './types';

export class MeasurementLine {
  private _geometry: LineGeometry | null;
  private _material: LineMaterial | null;
  private _position: Float32Array;
  private _distanceToCamera: number = 0;

  private _options: MeasurementOptions;

  constructor(options: MeasurementOptions) {
    this._position = new Float32Array(6);
    this._geometry = null;
    this._material = null;
    this._options = { ...options };
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
      transparent: true,
      opacity: 1
    });

    const mesh = new Line2(this._geometry, this._material);
    //Assign bounding sphere & box for the line to support raycasting.
    mesh.computeLineDistances();
    //Make sure line are rendered in-front of other objects
    mesh.renderOrder = 1;
    mesh.onBeforeRender = () => {
      this._material?.resolution.set(window.innerWidth, window.innerHeight);
    };

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
      this._material?.setValues({ opacity: 0.5 });
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
  setOptions(options: MeasurementOptions): void {
    this._options.lineWidth = options?.lineWidth ?? this._options.lineWidth;
    this._options.color = options?.color ?? this._options.color;
    //Apply for current line.
    if (this._material) {
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
   * Clear all line objects geometry & material.
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
}
