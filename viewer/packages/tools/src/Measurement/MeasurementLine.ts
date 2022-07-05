/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { Line2 } from 'three/examples/jsm/lines/Line2';

export class MeasurementLine {
  private _geometry: LineGeometry | null;
  private readonly _meshes: THREE.Group;
  private readonly _fixedWidthLineMaterial: LineMaterial;
  private readonly _adaptiveWidthLineMaterial: LineMaterial;
  private _position: Float32Array;
  private _distanceToCamera: number = 0;

  constructor(lineWidth: number, lineColor: number) {
    this._position = new Float32Array(6);
    this._geometry = null;

    //Adaptive Line width & line width is multipled with scale factor due to adaptive calculation in shaders.
    this._adaptiveWidthLineMaterial = new LineMaterial({
      color: lineColor,
      lineWidth,
      worldUnits: true,
      depthTest: false,
      transparent: true,
      opacity: 1
    });

    //Fixed line Width.
    this._fixedWidthLineMaterial = new LineMaterial({
      color: lineColor,
      lineWidth: 2, // TODO 2022-07-05 larsmoa: Should this be variable?
      worldUnits: false,
      depthTest: false,
      transparent: true,
      opacity: 1
    });

    this._meshes = new THREE.Group();
    this._meshes.name = 'Measurement';

    const onBeforeRenderTrigger = new THREE.Mesh(new THREE.BufferGeometry());
    onBeforeRenderTrigger.name = 'onBeforeRenderTrigger trigger (no geometry)';
    onBeforeRenderTrigger.frustumCulled = false;
    onBeforeRenderTrigger.onBeforeRender = renderer => {
      const { width, height } = renderer.domElement.getBoundingClientRect();
      this._adaptiveWidthLineMaterial.resolution = this._fixedWidthLineMaterial.resolution = new THREE.Vector2(
        width,
        height
      );
    };
    this._meshes.add(onBeforeRenderTrigger);
  }

  dispose(): void {
    if (this._geometry !== null) {
      this._geometry.dispose();
    }
    this._meshes.clear();
    this._adaptiveWidthLineMaterial.dispose();
    this._fixedWidthLineMaterial.dispose();
  }

  get meshes(): THREE.Group {
    return this._meshes;
  }

  /**
   * Generating Line geometry and create the mesh.
   * @param point Point from where the line will be generated.
   * @param distanceToCamera Distance to camera from the @point
   */
  startLine(point: THREE.Vector3, distanceToCamera: number): void {
    this._position[0] = this._position[3] = point.x;
    this._position[1] = this._position[4] = point.y;
    this._position[2] = this._position[5] = point.z;

    this._distanceToCamera = distanceToCamera;

    this._geometry = new LineGeometry();
    this._geometry.setPositions(this._position);

    const adaptiveMesh = new Line2(this._geometry, this._adaptiveWidthLineMaterial);
    //Assign bounding sphere & box for the line to support raycasting.
    adaptiveMesh.computeLineDistances();
    //Make sure line are rendered in-front of other objects.
    adaptiveMesh.renderOrder = 100;

    //Fixed line width when camera is zoom out or far away from the line.
    const fixedMesh = new Line2(this._geometry, this._fixedWidthLineMaterial);
    fixedMesh.computeLineDistances();
    fixedMesh.renderOrder = 100;

    this._meshes.add(adaptiveMesh);
    this._meshes.add(fixedMesh);
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
    //Check if measurement is not ended.
    if (!endPoint) {
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
    } else {
      position.copy(endPoint);
    }

    this._position[3] = position.x;
    this._position[4] = position.y;
    this._position[5] = position.z;
    //Update the line geometry end point.
    this._geometry?.setPositions(this._position);
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
}
