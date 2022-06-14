/*!
 * Copyright 2022 Cognite AS
 */

import { Cognite3DViewer } from '@reveal/core';
import { Cognite3DViewerToolBase } from '../Cognite3DViewerToolBase';
import * as THREE from 'three';
import { MeasurementOptions, MeasurementLabelData } from './types';
import { Measurement } from './Measurement';
import { HtmlOverlayTool, HtmlOverlayToolOptions } from '../HtmlOverlay/HtmlOverlayTool';

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
 * @example
 * ```jsx runnable
 * const measurementTool = new MeasurementTool(viewer, {changeMeasurementLabelMetrics: (distance) => {
 *    // 1 meters = 3.281 feet
 *    const distanceInFeet = distance * 3.281;
 *    return { distance: distanceInFeet, units: 'ft'};
 *  }});
 *  measurementTool.enterMeasurementMode();
```
 */
export class MeasurementTool extends Cognite3DViewerToolBase {
  private readonly _viewer: Cognite3DViewer;
  private readonly _measurements: Measurement[];
  private _options: MeasurementOptions | undefined;
  private _currentMeasurementIndex: number;
  private _measurementActive: boolean;
  private readonly _htmlOverlay: HtmlOverlayTool;
  private readonly _handleClustering = this.createEmptyClusterElement.bind(this);
  private readonly _overlayOptions: HtmlOverlayToolOptions = {
    clusteringOptions: { mode: 'overlapInScreenSpace', createClusterElementCallback: this._handleClustering }
  };

  private readonly _handleonPointerClick = this.onPointerClick.bind(this);
  private readonly _handleonPointerMove = this.onPointerMove.bind(this);
  private readonly _handleDefaultOptions = this.defaultOptions.bind(this);

  constructor(viewer: Cognite3DViewer, options?: MeasurementOptions) {
    super();
    this._viewer = viewer;
    this._options = {
      changeMeasurementLabelMetrics: this._handleDefaultOptions,
      lineWidth: 0.01,
      color: 0x00ffff,
      ...options
    };
    this._measurements = [];
    this._htmlOverlay = new HtmlOverlayTool(this._viewer, this._overlayOptions);
    this._currentMeasurementIndex = -1;
    this._measurementActive = false;
  }

  /**
   * Enter into point to point measurement mode.
   */
  enterMeasurementMode(): void {
    this.setupEventHandling();
  }

  /**
   * Exit measurement mode.
   */
  exitMeasurementMode(): void {
    //clear all mesh, geometry & event handling.
    this._measurements.forEach(measurement => {
      measurement.clearObjects();
    });
    this.removeEventHandling();
  }

  /**
   * Removes a measurement from the Cognite3DViewer.
   * @param measurement Measurement mesh to be removed from @Cognite3DViewer.
   */
  removeMeasurement(measurement: THREE.Mesh): void {
    const index = this._measurements.findIndex(obj => obj.getMesh() === measurement);
    if (index > -1) {
      this._measurements[index].removeMeasurement();
      this._measurements.splice(index, 1);
    }
  }

  /**
   * Removes all measurements from the Cognite3DViewer.
   */
  removeAllMeasurement(): void {
    this._measurements.forEach(measurement => {
      measurement.removeMeasurement();
    });
    this._measurements.splice(0);
  }

  /**
   * Get all measurement objects from the Cognite3DViewer.
   * @returns Group of all measurements in the Cognite3DViewer.
   */
  getAllMeasurement(): THREE.Mesh[] {
    const measurementGroups: THREE.Mesh[] = [];
    this._measurements.forEach(measurement => {
      const meshGrp = measurement.getMesh();
      if (meshGrp) {
        measurementGroups.push(meshGrp);
      }
    });
    return measurementGroups;
  }

  /**
   * Sets Measurement line width and color with @options value.
   * @param options MeasurementOptions to set line width and color.
   * @param meshObject Measurement mesh object to edit line width and color.
   */
  setLineOptions(options: MeasurementOptions, meshObject?: THREE.Mesh): void {
    if (meshObject) {
      const measurement = this._measurements.find(measurement => measurement.getMesh() === meshObject);
      measurement?.setLineOptions(options);
      this._viewer.requestRedraw();
    }
    this._options = { changeMeasurementLabelMetrics: this._options?.changeMeasurementLabelMetrics, ...options };
  }

  /**
   * Dispose Measurement Tool.
   */
  dispose(): void {
    this.removeAllMeasurement();
    this._htmlOverlay.clear();
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
      this._measurements.push(new Measurement(this._viewer, this._options!, this._htmlOverlay));
      this._currentMeasurementIndex++;
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

  /**
   * Function for callback to set default measuring units for the labels.
   * @returns Returns default label data with meter units.
   */
  private defaultOptions(): MeasurementLabelData | undefined {
    return this._measurements[this._currentMeasurementIndex].setDefaultOptions();
  }

  /**
   * Create and return empty HTMLDivElement.
   * @returns HTMLDivElement.
   */
  private createEmptyClusterElement() {
    return document.createElement('div');
  }
}
