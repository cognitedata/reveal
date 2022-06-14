/*!
 * Copyright 2022 Cognite AS
 */

import { Cognite3DViewer, Intersection } from '@reveal/core';
import * as THREE from 'three';
import { HtmlOverlayTool } from '../HtmlOverlay/HtmlOverlayTool';
import { MeasurementLabels } from './MeasurementLabels';
import { MeasurementLine } from './MeasurementLine';
import { MeasurementOptions, MeasurementLabelUpdateDelegate, MeasurementLabelData } from './types';

export class Measurement {
  private readonly _viewer: Cognite3DViewer;
  private readonly _measurementLabel: MeasurementLabels;
  private readonly _line: MeasurementLine;
  private _lineMesh: THREE.Mesh | null;
  private readonly _startEndSpheres: THREE.Mesh[];
  private readonly _options: MeasurementOptions | undefined;
  private _distanceValue: string;
  private readonly _domElement: HTMLElement;
  private readonly _camera: THREE.Camera;
  private readonly _htmlOverlay: HtmlOverlayTool;
  private _labelElement: HTMLDivElement | null;

  constructor(viewer: Cognite3DViewer, options: MeasurementOptions, overlay: HtmlOverlayTool) {
    this._viewer = viewer;
    this._options = options;
    this._lineMesh = null;
    this._startEndSpheres = [];
    this._line = new MeasurementLine(this._options);
    this._measurementLabel = new MeasurementLabels();
    this._htmlOverlay = overlay;
    this._labelElement = null;
    this._domElement = this._viewer.domElement;
    this._camera = this._viewer.getCamera();
    this._distanceValue = '';
  }

  /**
   * Start the measurement.
   * @param intersection Intersection Object containing point & camera distance.
   */
  startMeasurement(intersection: Intersection): void {
    //Clear the line objects if exists for new line.
    this._line.clearObjects();
    this._startEndSpheres.push(this._line.addSphere(intersection.point));
    this._lineMesh = this._line.startLine(intersection.point, intersection.distanceToCamera);
    //Add the sphere and line into the viewer.
    this._viewer.addObject3D(this._startEndSpheres[0]);
    this._viewer.addObject3D(this._lineMesh);
  }

  /**
   * Update the measurement line.
   * @param event Mouse Event.
   */
  update(event: any): void {
    const { offsetX, offsetY } = event;
    this._line.updateLine(offsetX, offsetY, this._domElement, this._camera);
  }

  /**
   * End the measurement.
   * @param point Point at which measuring line ends.
   */
  endMeasurement(point: THREE.Vector3): void {
    //Update the line with final end point.
    this._startEndSpheres.push(this._line.addSphere(point));
    this._viewer.addObject3D(this._startEndSpheres[1]);
    this._line.updateLine(0, 0, this._domElement, this._camera, point);
    this.setMeasurementValue(this._options!.changeMeasurementLabelMetrics!);
    //Add the measurement label.
    this._labelElement = this.addLabel(this._line.getMidPointOnLine(), this._distanceValue);
  }

  /**
   * Clear the measurement line objects.
   */
  clearObjects(): void {
    this._line.clearObjects();
  }

  /**
   * Remove the measurement.
   */
  removeMeasurement(): void {
    if (this._lineMesh) {
      this._viewer.removeObject3D(this._lineMesh);
    }
    this._startEndSpheres.forEach(sphere => {
      this._viewer.removeObject3D(sphere);
    });
    this._startEndSpheres.splice(0);

    if (this._htmlOverlay && this._labelElement) {
      this._htmlOverlay.remove(this._labelElement!);
    }
  }

  /**
   * Sets Measurement line width and color with @options value.
   * @param options MeasurementLineOptions to set line width and color.
   */
  setLineOptions(options: MeasurementOptions): void {
    this._line.setOptions(options);
  }

  /**
   * Set the default measured label values with units & distance.
   * @returns Label data with distance and units.
   */
  setDefaultOptions(): MeasurementLabelData {
    return { distance: this._line.getMeasuredDistance(), units: 'm' };
  }

  /**
   * Get all the line meshes in the measurement.
   * @returns Array of line meshes.
   */
  getMesh(): THREE.Mesh | null {
    return this._lineMesh;
  }

  /**
   * Set the measurement data.
   * @param options Callback function which get user value to be added into label.
   */
  private setMeasurementValue(options: MeasurementLabelUpdateDelegate) {
    const measurementLabelData = options(this._line.getMeasuredDistance());
    this._distanceValue = measurementLabelData?.distance?.toFixed(2) + ' ' + measurementLabelData?.units;
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
}
