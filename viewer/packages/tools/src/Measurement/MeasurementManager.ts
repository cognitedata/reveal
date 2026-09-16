/*!
 * Copyright 2022 Cognite AS
 */

import type { Camera, Color, Group, Plane } from 'three';
import { Ray, Vector3 } from 'three';
import type { HtmlOverlayTool } from '../HtmlOverlay/HtmlOverlayTool';
import { MeasurementLabels } from './MeasurementLabels';
import { MeasurementLine } from './MeasurementLine';
import type { Measurement, MeasurementOptions } from './types';
import { getNormalizedPixelCoordinates } from '@reveal/utilities';

export class MeasurementManager {
  private readonly _measurementLabel: MeasurementLabels;
  private readonly _line: MeasurementLine;
  private readonly _options: Required<MeasurementOptions>;
  private readonly _domElement: HTMLElement;
  private readonly _camera: Camera;
  private readonly _meshGroup: Group;
  private readonly _htmlOverlay: HtmlOverlayTool;
  private _labelElement: HTMLDivElement | undefined;
  private readonly _distanceToCamera: number;
  private readonly _startPoint: Vector3;
  private _measurement: Measurement = {
    measurementId: 0,
    startPoint: new Vector3(),
    endPoint: new Vector3(),
    distanceInMeters: 0
  };

  constructor(
    viewerDomElement: HTMLElement,
    camera: Camera,
    meshGroup: Group,
    options: Required<MeasurementOptions>,
    overlay: HtmlOverlayTool,
    startPoint: Vector3
  ) {
    this._options = options;
    this._measurementLabel = new MeasurementLabels();
    this._htmlOverlay = overlay;
    this._domElement = viewerDomElement;
    this._camera = camera;
    this._meshGroup = meshGroup;
    this._startPoint = startPoint;
    this._distanceToCamera = this._camera.getWorldPosition(new Vector3()).distanceTo(startPoint);
    this._line = this.startMeasurement(startPoint);
    this._meshGroup.add(this._line.meshes);
  }

  /**
   * Update the measurement line end point to the provided mouse coordinates
   */
  update(mouseEvent: { offsetX: number; offsetY: number }): void {
    const { offsetX, offsetY } = mouseEvent;
    this._line.updateLine(this.pointerTo3DPosition(offsetX, offsetY));
  }

  /**
   * End the measurement.
   * @param point World position at which measuring line ends.
   */
  endMeasurement(point: Vector3): void {
    const { distanceToLabelCallback } = this._options;
    //Update the line with final end point.
    this._line.updateLine(point);
    const label = distanceToLabelCallback(this._line.getMeasuredDistance());
    //Add the measurement label.
    this._labelElement = this.addLabel(this._line.getMidPointOnLine(), label);
    this._measurement = {
      measurementId: Date.now(),
      startPoint: this._startPoint,
      endPoint: point,
      distanceInMeters: this._line.getMeasuredDistance()
    };
  }

  /**
   * Remove the measurement.
   */
  removeMeasurement(): void {
    this._meshGroup.remove(this._line.meshes);

    if (this._labelElement) {
      this._htmlOverlay.remove(this._labelElement);
    }

    if (this._line) {
      this._line.dispose();
    }
  }

  getMeasurement(): Readonly<Measurement> {
    return this._measurement;
  }

  /**
   * Updates the measuring line clipping planes
   * @param clippingPlanes current active global clipping planes.
   */
  updateLineClippingPlanes(clippingPlanes: Plane[]): void {
    this._line.updateLineClippingPlanes(clippingPlanes);
    if (this._labelElement) {
      this._labelElement.hidden = !this._line.meshes.visible;
    }
  }

  /**
   * Update current line width.
   * @param lineWidth Width of the measuring line mesh.
   */
  updateLineWidth(lineWidth: number): void {
    this._line.updateLineWidth(lineWidth);
  }

  /**
   * Update current line color.
   * @param color Color of the measuring line mesh.
   */
  updateLineColor(color: Color): void {
    this._line.updateLineColor(color);
  }

  /**
   * Hide/unhide all measurements
   * @param enable
   */
  visible(enable: boolean): void {
    if (this._meshGroup) {
      this._meshGroup.visible = enable;
    }
  }

  /**
   * Start the measurement.
   * @param point World position to start measurement operation from.
   */
  private startMeasurement(point: Vector3): MeasurementLine {
    return new MeasurementLine(this._options.lineWidth, this._options.color, point);
  }

  /**
   * Creates a measurement label, add it to HTMLOverlay and return the created label element.
   * @param position Label position.
   * @param label Label text.
   * @returns HTML element.
   */
  private addLabel(position: Vector3, label: string): HTMLDivElement {
    const labelElement = this._measurementLabel.createLabel(label);
    this._htmlOverlay.add(labelElement, position);
    return labelElement;
  }

  private pointerTo3DPosition(offsetX: number, offsetY: number): Vector3 {
    const mouse = getNormalizedPixelCoordinates(this._domElement, offsetX, offsetY);

    // Set the origin of the Ray to camera.
    const origin = new Vector3();
    origin.setFromMatrixPosition(this._camera.matrixWorld);

    const ray = new Ray();
    ray.origin.copy(origin);

    // Calculate the camera direction.
    const direction = new Vector3(mouse.x, mouse.y, 0.5).unproject(this._camera).sub(ray.origin).normalize();
    ray.direction.copy(direction);

    // Note: Using the initial/start point as reference for ray to emit till that distance from camera.
    const position = new Vector3();
    ray.at(this._distanceToCamera, position);
    return position;
  }
}
