/*!
 * Copyright 2022 Cognite AS
 */

import { Cognite3DViewer } from '@reveal/api';
import { Cognite3DViewerToolBase } from '../Cognite3DViewerToolBase';
import * as THREE from 'three';
import { MeasurementOptions } from './types';
import { Measurement, MeasurementRef } from './Measurement';
import { HtmlOverlayTool, HtmlOverlayToolOptions } from '../HtmlOverlay/HtmlOverlayTool';
import rulerSvg from './styles/ruler.svg';
import { MeasurementLabels } from './MeasurementLabels';
import assert from 'assert';

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
  private _options: Required<MeasurementOptions>;

  private readonly _viewer: Cognite3DViewer;
  private readonly _geometryGroup = new THREE.Group();
  private readonly _measurements: Measurement[];
  private _currentMeasurementIndex: number;
  private readonly _htmlOverlay: HtmlOverlayTool;

  private readonly _handleLabelClustering = this.createCombineClusterElement.bind(this);
  private readonly _handlePointerClick = this.onPointerClick.bind(this);
  private readonly _handlePointerMove = this.onPointerMove.bind(this);

  private readonly _overlayOptions: HtmlOverlayToolOptions = {
    clusteringOptions: { mode: 'overlapInScreenSpace', createClusterElementCallback: this._handleLabelClustering }
  };

  private static readonly defaultLineOptions: Required<MeasurementOptions> = {
    distanceToLabelCallback: d => MeasurementTool.metersLabelCallback(d),
    lineWidth: 2.0,
    color: 0x00ffff
  };

  constructor(viewer: Cognite3DViewer, options?: MeasurementOptions) {
    super();
    this._viewer = viewer;
    this._options = {
      ...MeasurementTool.defaultLineOptions,
      ...options
    };
    this._measurements = [];
    this._htmlOverlay = new HtmlOverlayTool(this._viewer, this._overlayOptions);
    this._currentMeasurementIndex = -1;

    this._geometryGroup.name = MeasurementTool.name;
    this._viewer.addObject3D(this._geometryGroup);
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
      measurement.dispose();
    });
    this.removeEventHandling();
  }

  /**
   * Removes a measurement from the Cognite3DViewer.
   * @param measurementId Measurement Id of a measurement to be removed from @Cognite3DViewer.
   */
  removeMeasurement(measurementId: number): void {
    const index = this._measurements.findIndex(
      measurement => measurement.getMeasurementReference().measurementId === measurementId
    );
    if (index > -1) {
      this._measurements[index].removeMeasurement();
      this._measurements.splice(index, 1);
    }
  }

  /**
   * Removes all measurements from the Cognite3DViewer.
   */
  removeAllMeasurements(): void {
    this._measurements.forEach(measurement => {
      measurement.removeMeasurement();
    });
    this._measurements.splice(0);
    this._currentMeasurementIndex = -1;
  }

  /**
   * Sets the visiblity of labels in the Measurement.
   * @param enable
   */
  showMeasurementLabels(enable: boolean): void {
    if (this._htmlOverlay) {
      this._htmlOverlay.visible(enable);
    }
  }

  /**
   * Sets Measurement line width and color with @options value.
   * @param options MeasurementOptions to set line width and color.
   */
  setLineOptions(options: MeasurementOptions): void {
    // TODO 2022-07-05 larsmoa: WTF - clean up. Allowing setting options and then ignoring one of the options
    this._options = {
      ...MeasurementTool.defaultLineOptions,
      distanceToLabelCallback: this._options.distanceToLabelCallback,
      ...options
    };
  }

  /**
   * Update selected line width.
   * @param measurementId Measurement Id of a measurement.
   * @param lineWidth Width of the measuring line mesh.
   */
  updateLineWidth(measurementId: number, lineWidth: number): void {
    const index = this._measurements.findIndex(
      measurement => measurement.getMeasurementReference().measurementId === measurementId
    );
    if (index > -1) {
      this._measurements[index].updateLineWidth(lineWidth);
    }
  }

  /**
   * Update selected line color.
   * @param measurementId Measurement Id of a measurement.
   * @param color Color of the measuring line mesh.
   */
  updateLineColor(measurementId: number, color: number): void {
    const index = this._measurements.findIndex(
      measurement => measurement.getMeasurementReference().measurementId === measurementId
    );
    if (index > -1) {
      this._measurements[index].updateLineColor(color);
    }
  }

  /**
   * Get all measurements from @Cognite3DViewer.
   * @returns Array of Measurement reference consisting Id, start point, end point & measured distance.
   */
  getAllMeasurements(): MeasurementRef[] {
    const measurementRef: MeasurementRef[] = [];
    this._measurements.forEach(measurement => {
      measurementRef.push(measurement.getMeasurementReference());
    });
    return measurementRef;
  }

  /**
   * Dispose Measurement Tool.
   */
  dispose(): void {
    this.removeAllMeasurements();
    this._htmlOverlay.clear();
    super.dispose();
  }

  /**
   * Set input handling.
   */
  private setupEventHandling() {
    this._viewer.on('click', this._handlePointerClick);
  }

  /**
   * Remove input handling.
   */
  private removeEventHandling() {
    this._viewer.off('click', this._handlePointerClick);
  }

  private async onPointerClick(event: any): Promise<void> {
    const { offsetX, offsetY } = event;

    const intersection = await this._viewer.getIntersectionFromPixel(offsetX, offsetY);

    if (!intersection) {
      return;
    }

    const measurementActive = this._currentMeasurementIndex !== -1;

    if (!measurementActive) {
      const camera = this._viewer.getCamera();
      const domElement = this._viewer.domElement;
      this._measurements.push(
        new Measurement(domElement, camera, this._geometryGroup, this._options!, this._htmlOverlay)
      );
      this._currentMeasurementIndex = this._measurements.length - 1;
      this._viewer.domElement.addEventListener('mousemove', this._handlePointerMove);
      this._measurements[this._currentMeasurementIndex].startMeasurement(intersection.point);
    } else {
      this._measurements[this._currentMeasurementIndex].endMeasurement(intersection.point);
      this._currentMeasurementIndex = -1;
      this._viewer.domElement.removeEventListener('mousemove', this._handlePointerMove);
    }
    this._viewer.requestRedraw();
  }

  private onPointerMove(event: { offsetX: number; offsetY: number }) {
    assert(this._currentMeasurementIndex !== -1);
    this._measurements[this._currentMeasurementIndex].update(event);
    this._viewer.requestRedraw();
  }

  /**
   * Create and return combine ruler icon as HTMLDivElement.
   * @returns HTMLDivElement.
   */
  private createCombineClusterElement() {
    // TODO 2022-07-05 larsmoa: Move all ownership of labels here - currently responsibility is split
    // between several classes which is *bad*
    const combineElement = document.createElement('div');
    combineElement.className = MeasurementLabels.stylesId;
    combineElement.innerHTML = rulerSvg;

    return combineElement;
  }

  private static metersLabelCallback(distanceInMeters: number): string {
    return `${distanceInMeters.toFixed(2)} m`;
  }
}
