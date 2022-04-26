/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';
import { Cognite3DViewer } from '@reveal/core';
import { Cognite3DViewerToolBase } from '../Cognite3DViewerToolBase';
import { MeasurementControls } from './MeasurementControls';
import { MeasurementDistance } from './MeasurementDistance';
import { MeasurementLabelOptions, MeasurementLineOptions } from './types';

export class MeasurementTool extends Cognite3DViewerToolBase {
  private readonly _viewer: Cognite3DViewer;
  private readonly _measurementControls: MeasurementControls;
  private _measurementDistance: MeasurementDistance;
  private readonly _labelOptions: MeasurementLabelOptions = {
    size: 64,
    radius: 20,
    font: '',
    fontColor: '',
    fillColor: ''
  };
  private readonly _lineOptions: MeasurementLineOptions = {
    lineWidth: 0.02,
    color: new THREE.Color(0x0000ff)
  };

  constructor(viewer: Cognite3DViewer) {
    super();
    this._viewer = viewer;
    this._measurementControls = new MeasurementControls(this._viewer, this._labelOptions);
  }

  /**
   * Add Distance measurement
   */
  public addMeasurementDistance(): void {
    this._measurementDistance = new MeasurementDistance(this._viewer, this._lineOptions);
  }

  /**
   * Remove distance measurement
   */
  public removeMeasurementDistance(): void {
    this._measurementControls.remove();
  }

  public setLabelOptions(labelOptions: MeasurementLabelOptions): void {
    this._measurementControls.setLabelOptions(labelOptions);
  }

  public setLineOptions(lineOptions: MeasurementLineOptions): void {
    if (this._measurementDistance) {
      this._measurementDistance.setLineOptions(lineOptions);
    }
  }
}
