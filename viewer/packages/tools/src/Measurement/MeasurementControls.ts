/*!
 * Copyright 2022 Cognite AS
 */

import { Cognite3DViewer, Intersection } from '@reveal/core';
import * as THREE from 'three';
import { MeasurementLabel } from './MeasurementLabel';
import { MeasurementLineOptions, MeasurementOptions, MeasurementUnits, MeasurementUnitUpdateDelegate } from './types';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';

export class MeasurementControls {
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
  private _isLineDrawing: boolean;

  private readonly _handleonPointerClick = this.onPointerClick.bind(this);
  private readonly _handleonPointerMove = this.onPointerMove.bind(this);

  private readonly _lineOptions: MeasurementLineOptions = {
    lineWidth: 0.001,
    color: 0x00ffff
  };

  constructor(viewer: Cognite3DViewer, options?: MeasurementOptions) {
    this._viewer = viewer;
    this._options = options ?? {};
    this._measurementLabel = new MeasurementLabel(this._viewer);
    this._linePosition = new Float32Array(6);
    this._raycaster = new THREE.Raycaster();
    this._pointSize = 0.02;
    this._distanceValue = '';
    this._distanceToCamera = 0;
    this._isLineDrawing = false;
  }

  /**
   * Set input handling
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
   * Add an measurement to the control
   */
  add(): void {
    this.setupEventHandling();
  }

  /**
   * Remove measurement from control
   */
  remove(): void {
    if (this._lineMesh) {
      this._lineMesh.geometry.dispose();
      this._lineMesh = null;
      this.removeEventHandling();
    }
  }

  private async onPointerClick(event: MouseEvent) {
    const { offsetX, offsetY } = event;

    const intersection = await this._viewer.getIntersectionFromPixel(offsetX, offsetY);

    if (intersection) {
      this.addSphere(intersection.point, this._pointSize);

      if (!this._isLineDrawing) {
        this.startMeasurement(intersection);
        this._isLineDrawing = true;
      } else {
        this.endMeasurement(intersection.point);
        this._isLineDrawing = false;
      }
      this._viewer.requestRedraw();
    }
  }

  private startMeasurement(intersection: Intersection) {
    this._viewer.domElement.addEventListener('mousemove', this._handleonPointerMove);
    this.startLine(intersection.point);
    this._distanceToCamera = intersection.distanceToCamera;
  }

  private startLine(point: THREE.Vector3) {
    if (this._lineGeometry) {
      this._lineGeometry.dispose();
      this._lineGeometry = null;
    }
    if (this._lineMesh) {
      this._lineMesh = null;
    }
    if (this._lineMaterial) {
      this._lineMaterial.dispose();
      this._lineMaterial = null;
    }
    this._linePosition[0] = this._linePosition[3] = point.x;
    this._linePosition[1] = this._linePosition[4] = point.y;
    this._linePosition[2] = this._linePosition[5] = point.z;

    this._lineGeometry = new LineGeometry();
    this._lineGeometry.setPositions(this._linePosition);

    this._lineMaterial = new LineMaterial({ color: this._lineOptions.color, linewidth: this._lineOptions.lineWidth });

    this._lineMesh = new THREE.Mesh(this._lineGeometry, this._lineMaterial);
    this._viewer.addObject3D(this._lineMesh);
  }

  private endMeasurement(point: THREE.Vector3) {
    this.updateMeasurement(0, 0, point);

    const labelPosition = this.calculateMidpoint(
      new THREE.Vector3(this._linePosition[0], this._linePosition[1], this._linePosition[2]),
      point
    );
    this.assignMeasurementValue();
    this._measurementLabel.add(labelPosition, this._distanceValue);
    this._viewer.domElement.removeEventListener('mousemove', this._handleonPointerMove);
  }

  private calculateMidpoint(startPoint: THREE.Vector3, endPoint: THREE.Vector3): THREE.Vector3 {
    let direction = endPoint.clone().sub(startPoint);
    const length = direction.length();
    direction = direction.normalize().multiplyScalar(length * 0.5);

    return startPoint.clone().add(direction);
  }

  private getMeasurementValue() {
    const startPoint = new THREE.Vector3(this._linePosition[0], this._linePosition[1], this._linePosition[2]);
    const endPoint = new THREE.Vector3(this._linePosition[3], this._linePosition[4], this._linePosition[5]);
    return endPoint.distanceTo(startPoint);
  }

  private assignMeasurementValue() {
    const options = this._options.unitsUpdateCallback;
    if (options === undefined) {
      this._distanceValue = this.getMeasurementValue().toFixed(2).toString() + ' m';
    } else {
      this.updateMeasurementUnits(options);
    }
  }

  private updateMeasurementUnits(options: MeasurementUnitUpdateDelegate) {
    const units = options();
    switch (units) {
      case MeasurementUnits.Centimeter:
        this._distanceValue = (this.getMeasurementValue() * 100).toFixed(2).toString() + ' cm';
        break;
      case MeasurementUnits.Feet:
        this._distanceValue = (this.getMeasurementValue() * 3.281).toFixed(2).toString() + ' ft';
        break;
      case MeasurementUnits.Inches:
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

  private updateMeasurement(offsetX: number, offsetY: number, endPoint?: THREE.Vector3): void {
    const position = new THREE.Vector3();
    if (endPoint) {
      position.copy(endPoint);
    } else {
      const mouse = new THREE.Vector2();
      mouse.x = (offsetX / this._viewer.domElement.clientWidth) * 2 - 1;
      mouse.y = -(offsetY / this._viewer.domElement.clientHeight) * 2 + 1;
      this._raycaster.setFromCamera(mouse, this._viewer.getCamera());

      this._raycaster.ray.at(this._distanceToCamera, position);
    }

    this._linePosition[3] = position.x;
    this._linePosition[4] = position.y;
    this._linePosition[5] = position.z;
    this._lineGeometry.setPositions(this._linePosition);
  }

  private addSphere(position: THREE.Vector3, size: number) {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(1),
      new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.5, transparent: true })
    );
    mesh.position.copy(position);
    mesh.scale.copy(mesh.scale.multiplyScalar(size));

    this._viewer.addObject3D(mesh);
  }

  /**
   * Update the Measurement Line width & color
   * @param options Line Options of width & color
   */
  updateLineOptions(options: MeasurementLineOptions): void {
    if (this._lineMesh) {
      this._lineOptions.lineWidth = options?.lineWidth ?? this._lineOptions.lineWidth;
      this._lineOptions.color = options?.color ?? this._lineOptions.color;
      this._pointSize = options?.lineWidth || this._pointSize;
    }
  }

  /**
   * Dispose Measurement control
   */
  dispose(): void {
    this.remove();
  }
}
