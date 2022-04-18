/*!
 * Copyright 2022 Cognite AS
 */
import { Cognite3DViewer } from '@reveal/core';
import { Cognite3DViewerToolBase } from '../Cognite3DViewerToolBase';
import { MeasurementControls } from './MeasurementControls';
import { MeasurementDistance } from './MeasurementDistance';

export class MeasurementTool extends Cognite3DViewerToolBase {
  private readonly _viewer: Cognite3DViewer;
  private readonly _measurementControls: MeasurementControls;

  constructor(viewer: Cognite3DViewer) {
    super();
    this._viewer = viewer;
    this._measurementControls = new MeasurementControls(this._viewer);
  }

  /**
   * Add Distance measurement
   */
  public addMeasurementDistance(): void {
    this._measurementControls.add(new MeasurementDistance(this._viewer));
  }

  /**
   * Remove distance measurement
   */
  public removeMeasurementDistance(): void {
    this._measurementControls.remove();
  }
}
