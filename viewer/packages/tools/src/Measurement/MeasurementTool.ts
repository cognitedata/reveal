/*!
 * Copyright 2022 Cognite AS
 */

import { Cognite3DViewer, Intersection } from '@reveal/core';
import { Cognite3DViewerToolBase } from '../Cognite3DViewerToolBase';
import * as THREE from 'three';
import { MeasurementLabel } from './MeasurementLabel';
import { MeasurementLineOptions, MeasurementOptions, MeasurementUnits, MeasurementUnitUpdateDelegate } from './types';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';

export class MeasurementTool extends Cognite3DViewerToolBase {
  private readonly _viewer: Cognite3DViewer;
  private readonly _measurementLabel: MeasurementLabel;
  private _lineGeometry: LineGeometry;
  private _lineMesh: THREE.Mesh;
  private _lineMaterial: LineMaterial;
  private readonly _linePosition: Float32Array;
  private readonly _raycaster: THREE.Raycaster;
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
    this._measurementLabel = new MeasurementLabel(this._viewer);
    this._linePosition = new Float32Array(6);
    this._raycaster = new THREE.Raycaster();
    this._pointSize = 0.02;
    this._distanceValue = '';
    this._distanceToCamera = 0;
  }

  /**
   * Set input handling.
   */
  private setupEventHandling() {
    this._viewer.on('click', this._handleonPointerClick);
  }

  /**
   * Remove input handling
   */
  private removeEventHandling() {
    this._viewer.off('click', this._handleonPointerClick);
  }

  /**
   * Add an measurement.
   */
  add(): void {
    this.setupEventHandling();
  }

  /**
   * Remove measurement.
   */
  remove(): void {
    //remove measurement label, clear all mesh, geometry & event handling
    this._measurementLabel.remove();
    this.clearLineObjects();
    this.removeEventHandling();
  }

  /**
   * Clear all line objects mesh, geometry & material
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
        this.startMeasurement(intersection);
      } else {
        this.endMeasurement(intersection.point);
      }
      this._viewer.requestRedraw();
    }
  }

  /**
   * Start the measurement.
   * @param intersection Intersection Object containing point & camera distance.
   */
  private startMeasurement(intersection: Intersection) {
    this._viewer.domElement.addEventListener('mousemove', this._handleonPointerMove);
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

    const labelPosition = this.calculateMidpoint(
      new THREE.Vector3(this._linePosition[0], this._linePosition[1], this._linePosition[2]),
      point
    );
    this.assignMeasurementValue();
    this._measurementLabel.add(labelPosition, this._distanceValue);
    this._viewer.domElement.removeEventListener('mousemove', this._handleonPointerMove);
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
  private getMeasurementValue() {
    const startPoint = new THREE.Vector3(this._linePosition[0], this._linePosition[1], this._linePosition[2]);
    const endPoint = new THREE.Vector3(this._linePosition[3], this._linePosition[4], this._linePosition[5]);
    return endPoint.distanceTo(startPoint);
  }

  /**
   * Check if their is a request to show the measurment in feet, inches or centimeter unit, if not assign distance value to meters.
   */
  private assignMeasurementValue() {
    const options = this._options.unitsUpdateCallback;
    if (options === undefined) {
      this._distanceValue = this.getMeasurementValue().toFixed(2).toString() + ' m';
    } else {
      this.updateUnits(options);
    }
  }

  /**
   * Update the measurement units and calculate respective measuring values in passed units.
   * @param options Callback function which provides type of measuring unit.
   */
  private updateUnits(options: MeasurementUnitUpdateDelegate) {
    const units = options();
    switch (units) {
      case MeasurementUnits.Centimeter:
        // 1 meters = 100 centimeter
        this._distanceValue = (this.getMeasurementValue() * 100).toFixed(2).toString() + ' cm';
        break;
      case MeasurementUnits.Feet:
        // 1 meters = 3.281 feet
        this._distanceValue = (this.getMeasurementValue() * 3.281).toFixed(2).toString() + ' ft';
        break;
      case MeasurementUnits.Inches:
        // 1 meters = 32.37 inches
        this._distanceValue = (this.getMeasurementValue() * 39.37).toFixed(2).toString() + ' in';
        break;
      case MeasurementUnits.Meter:
      default:
        this._distanceValue = this.getMeasurementValue().toFixed(2).toString() + ' m';
        break;
    }
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
  private updateMeasurement(offsetX: number, offsetY: number, endPoint?: THREE.Vector3): void {
    const position = new THREE.Vector3();
    //Check if measurement is ended.
    if (endPoint) {
      position.copy(endPoint);
    } else {
      //Get position based on the mouse pointer X and Y value.
      const mouse = new THREE.Vector2();
      mouse.x = (offsetX / this._viewer.domElement.clientWidth) * 2 - 1;
      mouse.y = -(offsetY / this._viewer.domElement.clientHeight) * 2 + 1;
      this._raycaster.setFromCamera(mouse, this._viewer.getCamera());

      //Note: Using the initial/start point as reference for depth for ray casting.
      this._raycaster.ray.at(this._distanceToCamera, position);
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

  /**
   * Update the Measurement Line width & color
   * @param options Line Options of width & color
   */
  updateLineOptions(options: MeasurementLineOptions): void {
    this._lineOptions.lineWidth = options?.lineWidth ?? this._lineOptions.lineWidth;
    this._lineOptions.color = options?.color ?? this._lineOptions.color;
    this._pointSize = options?.lineWidth * 10.0 || this._pointSize;
  }

  /**
   * Dispose Measurement Tool
   */
  dispose(): void {
    this.remove();
    super.dispose();
  }
}
