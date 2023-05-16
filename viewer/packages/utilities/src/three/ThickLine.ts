/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { LineGeometry, LineMaterial, Line2 } from 'three-stdlib';

export class ThickLine {
  private readonly _geometry: LineGeometry;
  private readonly _meshes: THREE.Group;
  private readonly _fixedWidthLineMaterial: LineMaterial;
  private readonly _adaptiveWidthLineMaterial: LineMaterial;
  private readonly _startPosition: THREE.Vector3;
  private readonly _endPosition: THREE.Vector3;

  constructor(lineWidth: number, lineColor: THREE.Color, startPoint: THREE.Vector3, endPoint: THREE.Vector3) {
    this._geometry = new LineGeometry();

    this._startPosition = startPoint;
    this._endPosition = endPoint;

    // Adaptive line width
    this._adaptiveWidthLineMaterial = new LineMaterial({
      color: lineColor.getHex(),
      linewidth: lineWidth,
      worldUnits: true,
      depthTest: false,
      transparent: true
    });

    // Fixed line width
    this._fixedWidthLineMaterial = new LineMaterial({
      color: lineColor.getHex(),
      linewidth: 2,
      worldUnits: false,
      depthTest: false,
      transparent: true
    });

    this._meshes = new THREE.Group();
    this._meshes.name = 'Thick line';

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
    this.initializeMeshes();
    this.updateLineEndPoint(this._endPosition);
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
   * Update the line end point.
   * @param endPoint Second point of the line
   */
  updateLineEndPoint(endPoint: THREE.Vector3): void {
    this._endPosition.copy(endPoint);
    this._meshes.position.copy(this.getMidPointOnLine());
    this._meshes.lookAt(endPoint);
    this._meshes.scale.set(0, 0, endPoint.distanceTo(this._startPosition));
  }

  /**
   * Updates the line clipping planes
   * @param clippingPlanes current active global clipping planes.
   */
  updateLineClippingPlanes(clippingPlanes: THREE.Plane[]): void {
    const visible =
      !this.clippingPlanesContainPoint(clippingPlanes, this._startPosition) ||
      !this.clippingPlanesContainPoint(clippingPlanes, this._endPosition);
    this._meshes.visible = !visible;
  }

  /**
   * Get the distance between the line start point & end point.
   * @returns Return distance between start & end point of the line.
   */
  getLineLength(): number {
    return this._endPosition.distanceTo(this._startPosition);
  }

  /**
   * Calculate mid point on the Line.
   * @returns Returns mid point between start and end points.
   */
  getMidPointOnLine(): THREE.Vector3 {
    return this._endPosition.clone().add(this._startPosition).multiplyScalar(0.5);
  }

  /**
   * Update current line width.
   * @param lineWidth Width of the line mesh.
   */
  updateLineWidth(lineWidth: number): void {
    this._adaptiveWidthLineMaterial.linewidth = lineWidth;
  }

  /**
   * Update current line color.
   * @param color Color of the line mesh.
   */
  updateLineColor(color: THREE.Color): void {
    this._fixedWidthLineMaterial.color = this._adaptiveWidthLineMaterial.color = color;
  }

  /**
   * Set visibility
   */
  set visibility(visible: boolean) {
    this._fixedWidthLineMaterial.visible = this._adaptiveWidthLineMaterial.visible = visible;
  }

  /**
   * Generate line geometry and create the mesh.
   */
  private initializeMeshes(): void {
    this._geometry.setPositions([0, 0, -0.5, 0, 0, 0.5]);

    const adaptiveMesh = new Line2(this._geometry, this._adaptiveWidthLineMaterial);
    //Assign bounding sphere & box for the line to support raycasting.
    adaptiveMesh.computeLineDistances();
    adaptiveMesh.renderOrder = 100;

    const fixedMesh = new Line2(this._geometry, this._fixedWidthLineMaterial);
    fixedMesh.computeLineDistances();
    fixedMesh.renderOrder = 100;

    this._meshes.add(adaptiveMesh);
    this._meshes.add(fixedMesh);
  }

  private clippingPlanesContainPoint(planes: THREE.Plane[], point: THREE.Vector3) {
    return planes.every(p => p.distanceToPoint(point) > 0);
  }
}
