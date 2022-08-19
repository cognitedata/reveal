/*!
 * Copyright 2022 Cognite AS
 */

import assert from 'assert';
import * as THREE from 'three';
import { HtmlOverlayTool } from '../HtmlOverlay/HtmlOverlayTool';
import { MeasurementLabels } from './MeasurementLabels';
import { MeasurementLine } from './MeasurementLine';
import { MeasurementOptions } from './types';

export type MeasurementRef = {
  readonly measurementId: number;
  readonly startPoint: THREE.Vector3;
  readonly endPoint: THREE.Vector3;
  readonly distanceInMeters: number;
};

export class Measurement {
  private readonly _measurementLabel: MeasurementLabels;
  private _line: MeasurementLine | null = null;
  private readonly _options: Required<MeasurementOptions>;
  private readonly _domElement: HTMLElement;
  private readonly _camera: THREE.Camera;
  private readonly _meshGroup: THREE.Group;
  private readonly _htmlOverlay: HtmlOverlayTool;
  private _labelElement: HTMLDivElement | null = null;
  private readonly _distanceToCamera: number;
  private _measurementRef: MeasurementRef = {
    measurementId: 0,
    startPoint: new THREE.Vector3(),
    endPoint: new THREE.Vector3(),
    distanceInMeters: 0
  };

  constructor(
    viewerDomElement: HTMLElement,
    camera: THREE.Camera,
    meshGroup: THREE.Group,
    options: Required<MeasurementOptions>,
    overlay: HtmlOverlayTool,
    startPoint: THREE.Vector3
  ) {
    this._options = options;
    this._measurementLabel = new MeasurementLabels();
    this._htmlOverlay = overlay;
    this._domElement = viewerDomElement;
    this._camera = camera;
    this._meshGroup = meshGroup;
    this._distanceToCamera = this._camera.getWorldPosition(new THREE.Vector3()).distanceTo(startPoint);
    this.startMeasurement(startPoint);
  }

  /**
   * Update the measurement line to end at the provided mouse coordinates
   */
  update(mouseEvent: { offsetX: number; offsetY: number }): void {
    if (this._line === null) {
      throw new Error('Not currently measuring, call startMeasurement() first');
    }
    const { offsetX, offsetY } = mouseEvent;
    this._line.updateLine(this.pointerTo3Dposition(offsetX, offsetY));
  }

  /**
   * End the measurement.
   * @param point World position at which measuring line ends.
   */
  endMeasurement(point: THREE.Vector3): void {
    if (this._line === null) {
      throw new Error('Not currently measuring, call startMeasurement() first');
    }

    const { distanceToLabelCallback } = this._options;
    //Update the line with final end point.
    this._line.updateLine(point);
    const label = distanceToLabelCallback(this._line.getMeasuredDistance());
    //Add the measurement label.
    this._labelElement = this.addLabel(this._line.getMidPointOnLine(), label);
    this._measurementRef = {
      measurementId: Date.now(),
      startPoint: this._measurementRef.startPoint,
      endPoint: point,
      distanceInMeters: this._line.getMeasuredDistance()
    };
  }

  /**
   * Clear the measurement line objects.
   */
  dispose(): void {
    if (this._line !== null) {
      this.removeMeasurement();
      this._line.dispose();
      this._line = null;
    }
  }

  /**
   * Remove the measurement.
   */
  removeMeasurement(): void {
    if (this._line === null) {
      throw new Error('Not currently measuring, call startMeasurement() first');
    }

    this._meshGroup.remove(this._line.meshes);

    if (this._htmlOverlay && this._labelElement) {
      this._htmlOverlay.remove(this._labelElement);
    }
  }

  getMeasurementReference(): MeasurementRef {
    return this._measurementRef!;
  }

  /**
   * Update current line width.
   * @param lineWidth Width of the measuring line mesh.
   */
  updateLineWidth(lineWidth: number): void {
    this._line?.updateLineWidth(lineWidth);
  }

  /**
   * Update current line color.
   * @param color Color of the measuring line mesh.
   */
  updateLineColor(color: THREE.Color): void {
    this._line?.updateLineColor(color);
  }

  /**
   * Start the measurement.
   * @param point World position to start measurement operation from.
   */
  private startMeasurement(point: THREE.Vector3): void {
    assert(this._line === null, 'Already measuring');

    const lineWidth = this.determineLineWidthFromOptions();
    const lineColor = this.determineLineColorFromOptions();
    this._line = new MeasurementLine(lineWidth, lineColor, point);
    this._meshGroup.add(this._line.meshes);
    this._measurementRef.startPoint.copy(point);
  }

  /**
   * Creates a measurement label, add it to HTMLOverlay and return the created label element.
   * @param position Label position.
   * @param label Label text.
   * @returns HTML element.
   */
  private addLabel(position: THREE.Vector3, label: string): HTMLDivElement {
    const labelElement = this._measurementLabel.createLabel(label);
    this._htmlOverlay.add(labelElement, position);
    return labelElement;
  }

  private determineLineWidthFromOptions(): number {
    return this._options.lineWidth * 0.01;
  }

  // TODO 2022-07-05 larsmoa: Return proper color
  private determineLineColorFromOptions(): THREE.Color {
    return this._options.color;
  }

  private pointerTo3Dposition(offsetX: number, offsetY: number) {
    const position = new THREE.Vector3();
    //Get position based on the mouse pointer X and Y value.
    const mouse = new THREE.Vector2();
    mouse.x = (offsetX / this._domElement.clientWidth) * 2 - 1;
    mouse.y = -(offsetY / this._domElement.clientHeight) * 2 + 1;

    const direction = new THREE.Vector3();
    const ray = new THREE.Ray();
    const origin = new THREE.Vector3();

    //Set the origin of the Ray to camera.
    origin.setFromMatrixPosition(this._camera.matrixWorld);
    ray.origin.copy(origin);
    //Calculate the camera direction.
    direction.set(mouse.x, mouse.y, 0.5).unproject(this._camera).sub(ray.origin).normalize();
    ray.direction.copy(direction);
    //Note: Using the initial/start point as reference for ray to emit till that distance from camera.
    ray.at(this._distanceToCamera, position);

    return position;
  }
}
