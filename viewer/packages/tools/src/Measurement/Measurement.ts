/*!
 * Copyright 2022 Cognite AS
 */

import assert from 'assert';
import * as THREE from 'three';
import { HtmlOverlayTool } from '../HtmlOverlay/HtmlOverlayTool';
import { MeasurementLabels } from './MeasurementLabels';
import { MeasurementLine } from './MeasurementLine';
import { MeasurementOptions } from './types';

export class Measurement {
  private readonly _measurementLabel: MeasurementLabels;
  private _line: MeasurementLine | null = null;
  private readonly _options: Required<MeasurementOptions>;
  private readonly _domElement: HTMLElement;
  private readonly _camera: THREE.Camera;
  private readonly _meshGroup: THREE.Group;
  private readonly _htmlOverlay: HtmlOverlayTool;
  private _labelElement: HTMLDivElement | null = null;

  constructor(
    viewerDomElement: HTMLElement,
    camera: THREE.Camera,
    meshGroup: THREE.Group,
    options: Required<MeasurementOptions>,
    overlay: HtmlOverlayTool
  ) {
    this._options = options;
    this._measurementLabel = new MeasurementLabels();
    this._htmlOverlay = overlay;
    this._domElement = viewerDomElement;
    this._camera = camera;
    this._meshGroup = meshGroup;
  }

  /**
   * Start the measurement.
   * @param point World position to start measurement operation from.
   */
  startMeasurement(point: THREE.Vector3): void {
    assert(this._line === null, 'Already measuring');

    const distanceToCamera = this._camera.getWorldPosition(new THREE.Vector3()).distanceTo(point);
    const lineWidth = this.determineLineWidthFromOptions();
    const lineColor = this.determineLineColorFromOptions();
    this._line = new MeasurementLine(lineWidth, lineColor);
    this._line.startLine(point, distanceToCamera);
    this._meshGroup.add(this._line.meshes);
  }

  /**
   * Update the measurement line to end at the provided mouse coordinates
   */
  update(mouseEvent: { offsetX: number; offsetY: number }): void {
    if (this._line === null) {
      throw new Error('Not currently measuring, call startMeasurement() first');
    }
    const { offsetX, offsetY } = mouseEvent;
    this._line.updateLine(offsetX, offsetY, this._domElement, this._camera);
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
    this._line.updateLine(0, 0, this._domElement, this._camera, point);
    const label = distanceToLabelCallback(this._line.getMeasuredDistance());
    //Add the measurement label.
    this._labelElement = this.addLabel(this._line.getMidPointOnLine(), label);
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

  /**
   * Creates a measurement label, add it to HTMLOverlay and return the created label element.
   * @param position Label position.
   * @param label Label text.
   * @returns Label HTML element.
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
  private determineLineColorFromOptions(): number {
    return this._options.color;
  }
}
