/*!
 * Copyright 2022 Cognite AS
 */
import { Cognite3DViewer } from '@reveal/core';
import { Vector3 } from 'three';
import { Cognite3DViewerToolBase } from '../Cognite3DViewerToolBase';
import { MeasurementControls } from './MeasurementControls';
import { MeasurementDistance } from './MeasurementDistance';
import { MeasurementLineOptions } from './types';

export class MeasurementTool extends Cognite3DViewerToolBase {
  private readonly _viewer: Cognite3DViewer;
  private readonly _measurementControls: MeasurementControls;
  private _measurementDistance: MeasurementDistance;

  constructor(viewer: Cognite3DViewer) {
    super();
    this._viewer = viewer;
    this._measurementControls = new MeasurementControls(this._viewer);
  }

  /**
   * Add Distance measurement
   */
  public addMeasurementDistance(): void {
    this._measurementDistance = new MeasurementDistance(this._viewer);
    this._measurementControls.add(this._measurementDistance);
  }

  /**
   * Remove distance measurement
   */
  public removeMeasurementDistance(): void {
    this._measurementControls.remove();
  }

  /**
   * Set Line width & Color
   * @param lineOptions MeasurementLineOptions.lineWidth or MeasurementLineOptions.color or both
   */
  public setLineOptions(lineOptions: MeasurementLineOptions): void {
    if (this._measurementControls) {
      this._measurementControls.updateLineOptions(lineOptions);
    }
  }

  public setMeasurementDistanceAxis(axis: THREE.Vector3): void {}
}
