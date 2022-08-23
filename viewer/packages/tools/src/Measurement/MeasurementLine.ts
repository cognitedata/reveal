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
  private _axisDistance: THREE.Vector3;
  private _xAxisMidPoint: THREE.Vector3;
  private _yAxisMidPoint: THREE.Vector3;
  private _zAxisMidPoint: THREE.Vector3;
  private readonly _lineWidth: number;

  constructor(lineWidth: number, lineColor: THREE.Color, startPoint: THREE.Vector3) {
    this._position = new Float32Array(6);
    this._axisDistance = new THREE.Vector3();
    this._xAxisMidPoint = new THREE.Vector3();
    this._yAxisMidPoint = new THREE.Vector3();
    this._zAxisMidPoint = new THREE.Vector3();
    this._geometry = null;
    this._lineWidth = lineWidth;

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
      linewidth: 2, // TODO 2022-07-05 larsmoa: Should this be variable?
      worldUnits: false,
      depthTest: false
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
    this.startLine(startPoint);
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
   * Update the measuring line end point.
   * @param endPoint Second point of the line to end the measurement.
   */
  updateLine(endPoint: THREE.Vector3): void {
    this._position[3] = endPoint.x;
    this._position[4] = endPoint.y;
    this._position[5] = endPoint.z;
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
   * Calculate mid point on the Line.
   * @returns Returns mid point between start and end points.
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
   * @param point Point from where the line will be generated.
   */
  private startLine(point: THREE.Vector3): void {
    this._position[0] = this._position[3] = point.x;
    this._position[1] = this._position[4] = point.y;
    this._position[2] = this._position[5] = point.z;

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
    const verticalLine = this.addAxisLine(yAxisLinePosition, 0x00ff00);
    this._yAxisMidPoint = this.setAxisMidPosition(yAxisLinePosition);

    //Horizontal distance line
    const xAxisLinePosition = new Float32Array(6);
    xAxisLinePosition.set(yAxisLinePosition.slice(3, 6), 0);
    xAxisLinePosition[3] = yAxisLinePosition[3];
    xAxisLinePosition[4] = yAxisLinePosition[4];
    xAxisLinePosition[5] = yAxisLinePosition[5] - this._axisDistance.z;
    const horizontalLine = this.addAxisLine(xAxisLinePosition, 0xff0000);
    this._xAxisMidPoint = this.setAxisMidPosition(xAxisLinePosition);

    //Depth distance line
    const zAxisLinePosition = new Float32Array(6);
    zAxisLinePosition[4] += this._axisDistance.y;
    zAxisLinePosition.set(xAxisLinePosition.slice(3, 6), 0);
    zAxisLinePosition[3] = xAxisLinePosition[3] - this._axisDistance.y;
    zAxisLinePosition[4] = xAxisLinePosition[4];
    zAxisLinePosition[5] = xAxisLinePosition[5];
    const depthLine = this.addAxisLine(zAxisLinePosition, 0x0000ff);
    this._zAxisMidPoint = this.setAxisMidPosition(zAxisLinePosition);

    return [verticalLine, horizontalLine, depthLine];
  }

  getAxisDistances(): THREE.Vector3 {
    return this._axisDistance;
  }

  getAxisMidPoints(): THREE.Vector3[] {
    return [this._yAxisMidPoint, this._zAxisMidPoint, this._xAxisMidPoint];
  }

  private addAxisLine(position: Float32Array, color: number): THREE.Mesh {
    const axisLine = new LineGeometry();
    axisLine.setPositions(position);
    const axesLineMaterial = new LineMaterial({
      color: color,
      linewidth: this._lineWidth,
      depthTest: false,
      dashed: true,
      dashSize: 1,
      dashScale: 10,
      gapSize: 1,
      transparent: true,
      opacity: 0.5
    });
    const axisLineMesh = new Line2(axisLine, axesLineMaterial);
    axisLineMesh.computeLineDistances();
    axisLineMesh.onBeforeRender = () => {
      axesLineMaterial?.resolution.set(window.innerWidth, window.innerHeight);
    };

    return axisLineMesh;
  }

  private setAxisMidPosition(position: Float32Array): THREE.Vector3 {
    const tempPosition = this._position;
    this._position = position;
    const midPoint = this.getMidPointOnLine();
    this._position = tempPosition;

    return midPoint;
  }
}
