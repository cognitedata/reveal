/*!
 * Copyright 2022 Cognite AS
 */

import { Cognite3DViewer, Intersection } from '@reveal/core';
import * as THREE from 'three';
import { MeasurementLabels } from './MeasurementLabels';
import {
  MeasurementOptions,
  MeasurementLabelUpdateDelegate,
  MeasurementLabelData,
  MeasurementLineOptions
} from './types';
import { MeasurementLine } from './MeasurementLine';

export class Measurement {
  private readonly _viewer: Cognite3DViewer;
  private readonly _measurementLabel: MeasurementLabels;
  private readonly _line: MeasurementLine;
  private _lineMesh: THREE.Mesh | null;
  private readonly _options: MeasurementOptions | undefined;
  private _distanceValue: string;
  private readonly _domElement: HTMLElement;
  private readonly _camera: THREE.Camera;

  constructor(viewer: Cognite3DViewer, options?: MeasurementOptions) {
    this._viewer = viewer;
    this._options = options;
    this._lineMesh = null;
    this._line = new MeasurementLine();
    this._measurementLabel = new MeasurementLabels(this._viewer);
    this._domElement = this._viewer.domElement;
    this._camera = this._viewer.getCamera();
    this._distanceValue = '';
  }

  /**
   * Start the measurement.
   * @param intersection Intersection Object containing point & camera distance.
   */
  startMeasurement(intersection: Intersection): void {
    //Clear the line objects if exists for new line
    this._line.clearObjects();
    const sphere = this._line.addSphere(intersection.point);
    this._lineMesh = this._line.startLine(intersection.point, intersection.distanceToCamera);
    this._viewer.addObject3D(sphere);
    this._viewer.addObject3D(this._lineMesh);
  }

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
    const sphere = this._line.addSphere(point);
    this._viewer.addObject3D(sphere);
    this._line.updateLine(0, 0, this._domElement, this._camera, point);
    this.setMeasurementValue(this._options!.changeMeasurementLabelMetrics!);
    //Add the measurement label.
    this._measurementLabel.addLabel(this._line.getMidPointOnLine(), this._distanceValue);
    // this._lineMesh = null;
  }

  clearObjects(): void {
    this._line.clearObjects();
  }

  removeMeasurement(): void {
    if (this._lineMesh) {
      this._viewer.removeObject3D(this._lineMesh);
    }
  }

  /**
   * Sets Measurement line width and color with @options value.
   * @param options MeasurementLineOptions to set line width and color.
   */
  setLineOptions(options: MeasurementLineOptions): void {
    this._line.setOptions(options);
  }

  defaultOptions(): MeasurementLabelData {
    return { distance: this._line.getMeasuredDistance(), units: 'm' };
  }

  /**
   * Set the measurement data.
   * @param options Callback function which get user value to be added into label.
   */
  private setMeasurementValue(options: MeasurementLabelUpdateDelegate) {
    const measurementLabelData = options(this._line.getMeasuredDistance());
    this._distanceValue = measurementLabelData.distance?.toFixed(2) + ' ' + measurementLabelData.units;
  }
}
