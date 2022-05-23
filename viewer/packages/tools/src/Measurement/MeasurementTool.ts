/*!
 * Copyright 2022 Cognite AS
 */

import { Cognite3DViewer, Intersection } from '@reveal/core';
import { Cognite3DViewerToolBase } from '../Cognite3DViewerToolBase';
import * as THREE from 'three';
import { MeasurementLabels } from './MeasurementLabels';
import { MeasurementLineOptions, MeasurementOptions, MeasurementLabelUpdateDelegate } from './types';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';

/**
 * Enables {@see Cognite3DViewer} to perform a point to point measurement.
 * This can be achieved by selecting a point on the 3D Object and drag the pointer to
 * required point to get measurement of the distance.
 * The tools default measurement is in "Meters" as supported in Reveal, but it also provides
 * user to customise the measuring units based on their convinience with the callback.
 *
 * @example
 * ```js
 * const measurementTool = new MeasurementTool(viewer);
 * measurementTool.enterMeasurementMode();
 * // ...
 * measurementTool.exitMeasurementMode();
 *
 * // detach the tool from the viewer
 * measurementTool.dispose();
 * ```
 */
export class MeasurementTool extends Cognite3DViewerToolBase {
  private readonly _viewer: Cognite3DViewer;
  private readonly _measurementLabel: MeasurementLabels;
  private _lineGeometry: LineGeometry;
  private _lineMesh: THREE.Mesh;
  private _lineMaterial: LineMaterial;
  private readonly _linePosition: Float32Array;
  private readonly _options: MeasurementOptions;
  private _pointSize: number;
  private _distanceValue: string;
  private _distanceToCamera: number;

  private readonly _handleonPointerClick = this.onPointerClick.bind(this);
  private readonly _handleonPointerMove = this.onPointerMove.bind(this);

  private readonly _lineOptions: MeasurementLineOptions = {
    lineWidth: 0.002,
    color: 0x00ffff
  };

  constructor(viewer: Cognite3DViewer, options?: MeasurementOptions) {
    super();
    this._viewer = viewer;
    this._options = options ?? {};
    this._measurementLabel = new MeasurementLabels(this._viewer);
    this._linePosition = new Float32Array(6);
    this._pointSize = 0.02;
    this._distanceValue = '';
    this._distanceToCamera = 0;
  }

  /**
   * Enter into point to point measurement mode.
   */
  enterMeasurementMode(): void {
    this.setupEventHandling();
  }

  /**
   * Exit measurement mode.
   */
  exitMeasurementMode(): void {
    //remove measurement label, clear all mesh, geometry & event handling.
    this._measurementLabel.clearLabels();
    this.clearLineObjects();
    this.removeEventHandling();
  }

  /**
   * Sets Measurement line width and color with @options value.
   * @param options MeasurementLineOptions to set line width and color.
   */
  setLineOptions(options: MeasurementLineOptions): void {
    this._lineOptions.lineWidth = options?.lineWidth ?? this._lineOptions.lineWidth;
    this._lineOptions.color = options?.color ?? this._lineOptions.color;
    this._pointSize = options?.lineWidth * 10.0 || this._pointSize;
  }

  /**
   * Dispose Measurement Tool.
   */
  dispose(): void {
    this.exitMeasurementMode();
    super.dispose();
  }

  /**
   * Set input handling.
   */
  private setupEventHandling() {
    this._viewer.on('click', this._handleonPointerClick);
  }

  /**
   * Remove input handling.
   */
  private removeEventHandling() {
    this._viewer.off('click', this._handleonPointerClick);
  }

  /**
   * Clear all line objects mesh, geometry & material.
   */
  private clearLineObjects() {
    if (this._lineMesh) {
      this._lineMesh.geometry.dispose();
      this._lineMesh = null;
    }
    if (this._lineGeometry) {
      this._lineGeometry.dispose();
      this._lineGeometry = null;
    }
    if (this._lineMaterial) {
      this._lineMaterial.dispose();
      this._lineMaterial = null;
    }
  }

  private async onPointerClick(event: MouseEvent) {
    const { offsetX, offsetY } = event;

    const intersection = await this._viewer.getIntersectionFromPixel(offsetX, offsetY);

    if (intersection) {
      this.addSphere(intersection.point);

      if (!this._lineMesh) {
        this._viewer.domElement.addEventListener('mousemove', this._handleonPointerMove);
        this.startMeasurement(intersection);
      } else {
        this.endMeasurement(intersection.point);
        this._viewer.domElement.removeEventListener('mousemove', this._handleonPointerMove);
      }
      this._viewer.requestRedraw();
    }
  }

  /**
   * Start the measurement.
   * @param intersection Intersection Object containing point & camera distance.
   */
  private startMeasurement(intersection: Intersection) {
    this.startLine(intersection.point);
    this._distanceToCamera = intersection.distanceToCamera;
  }

  /**
   * Generating Line geometry and create the mesh.
   * @param point Point from where the line will be generated.
   */
  private startLine(point: THREE.Vector3) {
    this._linePosition[0] = this._linePosition[3] = point.x;
    this._linePosition[1] = this._linePosition[4] = point.y;
    this._linePosition[2] = this._linePosition[5] = point.z;

    this._lineGeometry = new LineGeometry();
    this._lineGeometry.setPositions(this._linePosition);

    this._lineMaterial = new LineMaterial({ color: this._lineOptions.color, linewidth: this._lineOptions.lineWidth });

    this._lineMesh = new THREE.Mesh(this._lineGeometry, this._lineMaterial);
    this._viewer.addObject3D(this._lineMesh);
  }

  /**
   * End the measurement.
   * @param point Point at which measuring line ends.
   */
  private endMeasurement(point: THREE.Vector3) {
    this.updateMeasurement(0, 0, point);
    this.generateAxesDistance();

    const labelPosition = this.calculateMidpoint(
      new THREE.Vector3(this._linePosition[0], this._linePosition[1], this._linePosition[2]),
      point
    );
    this.updateMeasurementValue(this._options.changeMeasurementLabelMetrics);
    this._measurementLabel.addLabel(labelPosition, this._distanceValue);
    this.clearLineObjects();
  }

  /**
   * Calculate mid point betwen two given points.
   * @param startPoint first point.
   * @param endPoint second point.
   * @returns Returns mid point between two points.
   */
  private calculateMidpoint(startPoint: THREE.Vector3, endPoint: THREE.Vector3): THREE.Vector3 {
    let direction = endPoint.clone().sub(startPoint);
    const length = direction.length();
    direction = direction.normalize().multiplyScalar(length * 0.5);

    return startPoint.clone().add(direction);
  }

  /**
   * Get the distance between the measuring line start point & end point.
   * @returns Return distance between start & end point of the line.
   */
  private getMeasuredDistance() {
    const startPoint = new THREE.Vector3(this._linePosition[0], this._linePosition[1], this._linePosition[2]);
    const endPoint = new THREE.Vector3(this._linePosition[3], this._linePosition[4], this._linePosition[5]);
    return endPoint.distanceTo(startPoint);
  }

  /**
   * Update the measurement data.
   * @param options Callback function which get user value to be added into label.
   */
  private updateMeasurementValue(options: MeasurementLabelUpdateDelegate) {
    const measurementLabelData = options(this.getMeasuredDistance()) || {
      distance: this.getMeasuredDistance(),
      units: 'm'
    };
    this._distanceValue = measurementLabelData.distance.toFixed(2) + ' ' + measurementLabelData.units;
  }

  private onPointerMove(event: MouseEvent) {
    const { offsetX, offsetY } = event;
    this.updateMeasurement(offsetX, offsetY);
    this._viewer.requestRedraw();
  }

  /**
   * Update the measuring line end point.
   * @param offsetX X Coordinate of the mouse pointer.
   * @param offsetY Y Coordinate of the mouse pointer.
   * @param endPoint Second point of the line to end the measurement.
   */
  private updateMeasurement(offsetX: number, offsetY: number, endPoint?: THREE.Vector3) {
    const position = new THREE.Vector3();
    //Check if measurement is ended.
    if (endPoint) {
      position.copy(endPoint);
    } else {
      //Get position based on the mouse pointer X and Y value.
      const mouse = new THREE.Vector2();
      mouse.x = (offsetX / this._viewer.domElement.clientWidth) * 2 - 1;
      mouse.y = -(offsetY / this._viewer.domElement.clientHeight) * 2 + 1;

      const camera = this._viewer.getCamera();
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
    }

    this._linePosition[3] = position.x;
    this._linePosition[4] = position.y;
    this._linePosition[5] = position.z;
    //Update the line geometry end point.
    this._lineGeometry.setPositions(this._linePosition);
  }

  /**
   * Creates sphere at given position.
   * @param position Position.
   */
  private addSphere(position: THREE.Vector3) {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(1),
      new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.5, transparent: true })
    );
    mesh.position.copy(position);
    mesh.scale.copy(mesh.scale.multiplyScalar(this._pointSize));

    this._viewer.addObject3D(mesh);
  }

  private generateAxesDistance() {
    const verticalDistance = this._linePosition[0] - this._linePosition[3];
    const horizontalDistance = this._linePosition[1] - this._linePosition[4];
    const depthDistance = this._linePosition[2] - this._linePosition[5];

    //Vertical distance line
    let yAxisLinePosition = new Float32Array(6);
    yAxisLinePosition = this._linePosition.slice();
    yAxisLinePosition[3] += verticalDistance;
    yAxisLinePosition[5] += depthDistance;
    this.addLine(yAxisLinePosition, 0x00ff00);

    //Horizontal distance line
    const xAxisLinePosition = new Float32Array(6);
    xAxisLinePosition.set(yAxisLinePosition.slice(3, 6), 0);
    xAxisLinePosition[3] = yAxisLinePosition[3];
    xAxisLinePosition[4] = yAxisLinePosition[4];
    xAxisLinePosition[5] = yAxisLinePosition[5] - depthDistance;
    this.addLine(xAxisLinePosition, 0xff0000);

    //Depth distance line
    const zAxisLinePosition = new Float32Array(6);
    zAxisLinePosition[4] += verticalDistance;
    zAxisLinePosition.set(xAxisLinePosition.slice(3, 6), 0);
    zAxisLinePosition[3] = xAxisLinePosition[3] - verticalDistance;
    zAxisLinePosition[4] = xAxisLinePosition[4];
    zAxisLinePosition[5] = xAxisLinePosition[5];
    this.addLine(zAxisLinePosition, 0x0000ff);
  }

  private addLine(position: Float32Array, color: number) {
    const axesLine = new LineGeometry();
    axesLine.setPositions(position);
    const axesLineMaterial = new LineMaterial({ color: color, linewidth: this._lineOptions.lineWidth / 2 });
    const axesLineMesh = new THREE.Mesh(axesLine, axesLineMaterial);

    this._viewer.addObject3D(axesLineMesh);
  }
}
