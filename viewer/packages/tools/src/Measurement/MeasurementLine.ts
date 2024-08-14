/*!
 * Copyright 2022 Cognite AS
 */

import { Line2, LineGeometry, LineMaterial, isPointVisibleByPlanes } from '@reveal/utilities';
import * as THREE from 'three';

export class MeasurementLine {
  private readonly _geometry: LineGeometry;
  private readonly _meshes: THREE.Group;
  private readonly _fixedWidthLineMaterial: LineMaterial;
  private readonly _adaptiveWidthLineMaterial: LineMaterial;
  private readonly _startPos: THREE.Vector3;
  private readonly _endpoint: THREE.Vector3;

  constructor(lineWidth: number, lineColor: THREE.Color, startPoint: THREE.Vector3) {
    this._geometry = new LineGeometry();

    this._startPos = startPoint;
    this._endpoint = new THREE.Vector3();

    //Adaptive Line width
    this._adaptiveWidthLineMaterial = new LineMaterial({
      color: lineColor.getHex(),
      linewidth: lineWidth,
      worldUnits: true,
      depthTest: false
    });

    //Fixed line Width.
    this._fixedWidthLineMaterial = new LineMaterial({
      color: lineColor.getHex(),
      linewidth: 2, // Tests have shown this to work reasonable on tested devices
      worldUnits: false,
      depthTest: false
    });

    this._meshes = new THREE.Group();
    this._meshes.name = 'Measurement';

    const onBeforeRenderTrigger = new THREE.Mesh(new THREE.BufferGeometry());
    onBeforeRenderTrigger.name = 'onBeforeRenderTrigger trigger (no geometry)';
    onBeforeRenderTrigger.frustumCulled = false;
    const resolution = new THREE.Vector2();
    onBeforeRenderTrigger.onBeforeRender = renderer => {
      const { width, height } = renderer.domElement.getBoundingClientRect();
      resolution.set(width, height);
      this._adaptiveWidthLineMaterial.resolution = this._fixedWidthLineMaterial.resolution = resolution;
    };
    this._meshes.add(onBeforeRenderTrigger);
    this.startLine();
  }

  dispose(): void {
    if (this._geometry) {
      this._geometry.dispose();
    }
    this._adaptiveWidthLineMaterial.dispose();
    this._fixedWidthLineMaterial.dispose();
    this._meshes.clear();
    this._meshes.removeFromParent();
  }

  get meshes(): THREE.Group {
    return this._meshes;
  }

  /**
   * Update the measuring line end point.
   * @param endPoint Second point of the line to end the measurement.
   */
  updateLine(endPoint: THREE.Vector3): void {
    this._endpoint.copy(endPoint);
    this._meshes.position.copy(this.getMidPointOnLine());
    this._meshes.lookAt(endPoint);
    this._meshes.scale.set(0, 0, endPoint.distanceTo(this._startPos));
  }

  /**
   * Updates the measuring line clipping planes
   * @param clippingPlanes current active global clipping planes.
   */
  updateLineClippingPlanes(clippingPlanes: THREE.Plane[]): void {
    const visible =
      !isPointVisibleByPlanes(clippingPlanes, this._startPos) ||
      !isPointVisibleByPlanes(clippingPlanes, this._endpoint);
    this._meshes.visible = !visible;
  }

  /**
   * Get the distance between the measuring line start point & end point.
   * @returns Return distance between start & end point of the line.
   */
  getMeasuredDistance(): number {
    return this._endpoint.distanceTo(this._startPos);
  }

  /**
   * Calculate mid point on the Line.
   * @returns Returns mid point between start and end points.
   */
  getMidPointOnLine(): THREE.Vector3 {
    return this._endpoint.clone().add(this._startPos).multiplyScalar(0.5);
  }

  /**
   * Update current line width.
   * @param lineWidth Width of the measuring line mesh.
   */
  updateLineWidth(lineWidth: number): void {
    this._adaptiveWidthLineMaterial.linewidth = lineWidth;
  }

  /**
   * Update current line color.
   * @param color Color of the measuring line mesh.
   */
  updateLineColor(color: THREE.Color): void {
    this._fixedWidthLineMaterial.color = this._adaptiveWidthLineMaterial.color = color;
  }

  /**
   * Generate line geometry and create the mesh.
   */
  private startLine(): void {
    this._geometry.setPositions([0, 0, -0.5, 0, 0, 0.5]);

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
}
