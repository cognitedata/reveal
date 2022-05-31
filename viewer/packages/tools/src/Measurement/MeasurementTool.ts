/*!
 * Copyright 2022 Cognite AS
 */

import { Cognite3DViewer } from '@reveal/core';
import { Cognite3DViewerToolBase } from '../Cognite3DViewerToolBase';
import { MeasurementLineOptions, MeasurementOptions, MeasurementLabelData } from './types';
import { Measurement } from './Measurement';

/**
 * Enables {@see Cognite3DViewer} to perform a point to point measurement.
 * This can be achieved by selecting a point on the 3D Object and drag the pointer to
 * required point to get measurement of the distance.
 * The tools default measurement is in "Meters" as supported in Reveal, but it also provides
 * user to customise the measuring units based on their convinience with the callback.
 *
 * @example
 * ```js
 * const measurementTool = new MeasurementTool(viewer);
 * measurementTool.enterMeasurementMode();
 * // ...
 * measurementTool.exitMeasurementMode();
 *
 * // detach the tool from the viewer
 * measurementTool.dispose();
 * ```
 */
export class MeasurementTool extends Cognite3DViewerToolBase {
  private readonly _viewer: Cognite3DViewer;
  private readonly _measurements: Measurement[];
  private readonly _options: MeasurementOptions | undefined;
  private _currentMeasurementIndex: number;
  private _measurementActive: boolean;

  private readonly _handleonPointerClick = this.onPointerClick.bind(this);
  private readonly _handleonPointerMove = this.onPointerMove.bind(this);
  private readonly _handleDefaultOptions = this.defaultOptions.bind(this);

  constructor(viewer: Cognite3DViewer, options?: MeasurementOptions) {
    super();
    this._viewer = viewer;
    this._options = { changeMeasurementLabelMetrics: this._handleDefaultOptions, ...options };
    this._measurements = new Array<Measurement>();
    this._currentMeasurementIndex = -1;
    this._measurementActive = false;
  }

  /**
   * Enter into point to point measurement mode.
   */
  enterMeasurementMode(): Measurement {
    const measurement = new Measurement(this._viewer, this._options);
    this._measurements.push(measurement);
    this.setupEventHandling();
    this._currentMeasurementIndex++;

    return measurement;
  }

  /**
   * Exit measurement mode.
   */
  exitMeasurementMode(): void {
    //clear all mesh, geometry & event handling.
    this._measurements[this._currentMeasurementIndex].clearObjects();
    this.removeEventHandling();
  }

  removeMeasurement(measurement: Measurement): void {
    const index = this._measurements.findIndex(obj => obj === measurement);
    if (index > -1) {
      // this._measurements[index].clearObjects();
      this._measurements[index].removeMeasurement();
      this._measurements.splice(index, 1);
    }
  }

  getAllMeasurement(): Measurement[] {
    return this._measurements;
  }

  removeAllMeasurement(): void {}

  /**
   * Sets Measurement line width and color with @options value.
   * @param options MeasurementLineOptions to set line width and color.
   */
  setLineOptions(options: MeasurementLineOptions): void {
    this._measurements[this._currentMeasurementIndex].setLineOptions(options);
    if (this._viewer) {
      this._viewer.requestRedraw();
    }
  }

  /**
   * Dispose Measurement Tool.
   */
  dispose(): void {
    this.exitMeasurementMode();
    super.dispose();
  }

  /**
   * Set input handling.
   */
  private setupEventHandling() {
    this._viewer.on('click', this._handleonPointerClick);
  }

  /**
   * Remove input handling.
   */
  private removeEventHandling() {
    this._viewer.off('click', this._handleonPointerClick);
  }

  private async onPointerClick(event: any): Promise<void> {
    const { offsetX, offsetY } = event;

    const intersection = await this._viewer.getIntersectionFromPixel(offsetX, offsetY);

    if (!intersection) {
      return;
    }

    if (!this._measurementActive) {
      this._viewer.domElement.addEventListener('mousemove', this._handleonPointerMove);
      this._measurements[this._currentMeasurementIndex].startMeasurement(intersection);
      this._measurementActive = true;
    } else {
      this._measurements[this._currentMeasurementIndex].endMeasurement(intersection.point);
      this._viewer.domElement.removeEventListener('mousemove', this._handleonPointerMove);
      this._measurementActive = false;
    }
    this._viewer.requestRedraw();
  }

  private onPointerMove(event: any) {
    this._measurements[this._currentMeasurementIndex].update(event);
    this._viewer.requestRedraw();
  }

  private defaultOptions(): MeasurementLabelData {
    return this._measurements[this._currentMeasurementIndex].defaultOptions();
  }
}
