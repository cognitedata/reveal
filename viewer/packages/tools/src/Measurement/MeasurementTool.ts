/*!
 * Copyright 2022 Cognite AS
 */

import { Cognite3DViewer, Intersection } from '@reveal/core';
import { Cognite3DViewerToolBase } from '../Cognite3DViewerToolBase';
import * as THREE from 'three';
import { MeasurementLabels } from './MeasurementLabels';
import {
  MeasurementLineOptions,
  MeasurementOptions,
  MeasurementLabelUpdateDelegate,
  MeasurementLabelData
} from './types';
import { MeasurementLine } from './MeasurementLine';

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
  private readonly _measurementLabel: MeasurementLabels;
  private readonly _line: MeasurementLine;
  private _lineMesh: THREE.Mesh;
  private readonly _options: Required<MeasurementOptions>;
  private _sphereSize: number;
  private _distanceValue: string;
  private readonly _domElement: HTMLElement;
  private readonly _camera: THREE.Camera;

  private readonly _handleonPointerClick = this.onPointerClick.bind(this);
  private readonly _handleonPointerMove = this.onPointerMove.bind(this);
  private readonly _handleDefaultOptions = this.defaultOptions.bind(this);

  constructor(viewer: Cognite3DViewer, options?: MeasurementOptions) {
    super();
    this._viewer = viewer;
    this._options = {
      changeMeasurementLabelMetrics: this._handleDefaultOptions,
      axisComponentMeasurement: false,
      ...options
    };
    this._line = new MeasurementLine();
    this._measurementLabel = new MeasurementLabels(this._viewer);
    this._domElement = this._viewer.domElement;
    this._camera = this._viewer.getCamera();
    this._sphereSize = 0.01;
    this._distanceValue = '';
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
    this._line.clearObjects();
    this.removeEventHandling();
  }

  /**
   * Sets Measurement line width and color with @options value.
   * @param options MeasurementLineOptions to set line width and color.
   */
  setLineOptions(options: MeasurementLineOptions): void {
    this._line.setOptions(options);
    this._sphereSize = options?.lineWidth || this._sphereSize;
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

  private async onPointerClick(event: MouseEvent) {
    const { offsetX, offsetY } = event;

    const intersection = await this._viewer.getIntersectionFromPixel(offsetX, offsetY);

    if (!intersection) {
      return;
    }

    this.addSphere(intersection.point);

    if (!this._lineMesh) {
      this._viewer.domElement.addEventListener('mousemove', this._handleonPointerMove);
      this.startMeasurement(intersection);
    } else {
      this.endMeasurement(intersection.point);
      this._viewer.domElement.removeEventListener('mousemove', this._handleonPointerMove);
    }
    this._viewer.requestRedraw();
  }

  /**
   * Start the measurement.
   * @param intersection Intersection Object containing point & camera distance.
   */
  private startMeasurement(intersection: Intersection) {
    this._lineMesh = this._line.startLine(intersection.point, intersection.distanceToCamera);
    this._viewer.addObject3D(this._lineMesh);
  }

  /**
   * End the measurement.
   * @param point Point at which measuring line ends.
   */
  private endMeasurement(point: THREE.Vector3) {
    //Update the line with final end point.
    this._line.updateLine(0, 0, this._domElement, this._camera, point);
    this.setMeasurementValue(this._options.changeMeasurementLabelMetrics);
    //Add the measurement label.
    this._measurementLabel.addLabel(this._line.getMidPointOnLine(), this._distanceValue);

    //Add axis component measurement data if enabled
    if (this._options.axisComponentMeasurement) {
      this.addAxisMeasurement();
    }
    this._line.clearObjects();
    this._lineMesh = null;
  }

  /**
   * Set the measurement data.
   * @param options Callback function which get user value to be added into label.
   */
  private setMeasurementValue(options: MeasurementLabelUpdateDelegate) {
    const measurementLabelData = options(this._line.getMeasuredDistance());
    this._distanceValue = measurementLabelData.distance.toFixed(2) + ' ' + measurementLabelData.units;
  }

  /**
   * Get and add axis measurement components for the point to point measurement
   */
  private addAxisMeasurement() {
    if (this._line) {
      const axisMeshes = this._line.getAxisLines();
      axisMeshes.forEach(mesh => {
        this._viewer.addObject3D(mesh);
      });
    }
  }

  private addAxisLabels() {
    // if (this._measurementLabel) {
    //   this._measurementLabel.addLabel()
    // }
  }

  private onPointerMove(event: MouseEvent) {
    const { offsetX, offsetY } = event;
    this._line.updateLine(offsetX, offsetY, this._domElement, this._camera);
    this._viewer.requestRedraw();
  }

  /**
   * Creates sphere at given position.
   * @param position Position.
   */
  private addSphere(position: THREE.Vector3) {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(1),
      new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.5, transparent: true })
    );
    mesh.position.copy(position);
    mesh.scale.copy(mesh.scale.multiplyScalar(this._sphereSize));

    this._viewer.addObject3D(mesh);
  }

  private defaultOptions(): MeasurementLabelData {
    return { distance: this._line.getMeasuredDistance(), units: 'm' };
  }
}
