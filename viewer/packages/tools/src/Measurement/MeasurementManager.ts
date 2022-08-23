/*!
 * Copyright 2022 Cognite AS
 */

import { Cognite3DViewer } from '@reveal/api';
import assert from 'assert';
import * as THREE from 'three';
import { HtmlOverlayTool, HtmlOverlayToolOptions } from '../HtmlOverlay/HtmlOverlayTool';
import { MeasurementLabels } from './MeasurementLabels';
import { MeasurementLine } from './MeasurementLine';
import { DistanceToLabelDelegate, MeasurementOptions } from './types';
import svg from '!!raw-loader!./styles/ruler.svg';

export type Measurement = {
  readonly measurementId: number;
  readonly startPoint: THREE.Vector3;
  readonly endPoint: THREE.Vector3;
  readonly distanceInMeters: number;
};

export class MeasurementManager {
  private readonly _measurementLabel: MeasurementLabels;
  private _line: MeasurementLine | null = null;
  private readonly _options: Required<MeasurementOptions>;
  private readonly _viewer: Cognite3DViewer;
  private readonly _domElement: HTMLElement;
  private readonly _camera: THREE.Camera;
  private readonly _meshGroup: THREE.Group;
  private readonly _htmlOverlay: HtmlOverlayTool;
  private _labelElement: HTMLDivElement | null = null;
  private readonly _distanceToCamera: number;
  private readonly _startPoint: THREE.Vector3;
  private _measurement!: Measurement;
  private _axesMesh: THREE.Mesh[];
  private readonly _axesHtmlOverlay: HtmlOverlayTool;
  private readonly _axesLabelElement: HTMLDivElement[];

  private readonly _handleLabelClustering = this.createCombineClusterElement.bind(this);
  private readonly _overlayOptions: HtmlOverlayToolOptions = {
    clusteringOptions: { mode: 'overlapInScreenSpace', createClusterElementCallback: this._handleLabelClustering }
  };

  constructor(
    viewer: Cognite3DViewer,
    camera: THREE.Camera,
    meshGroup: THREE.Group,
    options: Required<MeasurementOptions>,
    overlay: HtmlOverlayTool,
    startPoint: THREE.Vector3
  ) {
    this._options = options;
    this._viewer = viewer;
    this._measurementLabel = new MeasurementLabels();
    this._htmlOverlay = overlay;
    this._domElement = viewer.domElement;
    this._camera = camera;
    this._meshGroup = meshGroup;
    this._startPoint = startPoint;
    this._distanceToCamera = this._camera.getWorldPosition(new THREE.Vector3()).distanceTo(startPoint);
    this._axesMesh = [];
    this._axesHtmlOverlay = new HtmlOverlayTool(viewer, this._overlayOptions);
    this._axesLabelElement = [];
    this.startMeasurement(startPoint);
  }

  /**
   * Update the measurement line end point to the provided mouse coordinates
   */
  update(mouseEvent: { offsetX: number; offsetY: number }): void {
    if (this._line === null) {
      throw new Error('Not currently measuring, call startMeasurement() first');
    }
    const { offsetX, offsetY } = mouseEvent;
    this._line.updateLine(this.pointerTo3DPosition(offsetX, offsetY));
  }

  /**
   * End the measurement.
   * @param point World position at which measuring line ends.
   */
  endMeasurement(point: THREE.Vector3): void {
    if (this._line === null) {
      throw new Error('Not currently measuring, call startMeasurement() first');
    }

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

    this.addAxisMeasurement();
  }

  /**
   * Remove the measurement.
   */
  removeMeasurement(): void {
    if (this._line === null) {
      throw new Error('Not currently measuring, call startMeasurement() first');
    }

    this._meshGroup.remove(this._line.meshes);

    if (this._labelElement) {
      this._htmlOverlay.remove(this._labelElement);
    }

    if (this._line !== null) {
      this._line.dispose();
      this._line = null;
    }

    //Remove Axes lines & labels
    if (this._axesMesh.length > 0) {
      this._axesMesh.forEach(mesh => {
        this._viewer.removeObject3D(mesh);
      });
    }

    if (this._axesHtmlOverlay) {
      this._axesHtmlOverlay.clear();
    }
  }

  getMeasurement(): Readonly<Measurement> | null {
    if (this._measurement) {
      return this._measurement;
    }
    return null;
  }

  /**
   * Update current line width.
   * @param lineWidth Width of the measuring line mesh.
   */
  updateLineWidth(lineWidth: number): void {
    this._line?.updateLineWidth(lineWidth);
  }

  /**
   * Update current line color.
   * @param color Color of the measuring line mesh.
   */
  updateLineColor(color: THREE.Color): void {
    this._line?.updateLineColor(color);
  }

  /**
   * Start the measurement.
   * @param point World position to start measurement operation from.
   */
  private startMeasurement(point: THREE.Vector3): void {
    assert(this._line === null, 'Already measuring');

    const lineWidth = this.determineLineWidthFromOptions();
    const lineColor = this.determineLineColorFromOptions();
    this._line = new MeasurementLine(lineWidth, lineColor, point);
    this._meshGroup.add(this._line.meshes);
  }

  /**
   * Creates a measurement label, add it to HTMLOverlay and return the created label element.
   * @param position Label position.
   * @param label Label text.
   * @returns HTML element.
   */
  private addLabel(position: THREE.Vector3, label: string): HTMLDivElement {
    const labelElement = this._measurementLabel.createLabel(label);
    this._htmlOverlay.add(labelElement, position);
    return labelElement;
  }

  private determineLineWidthFromOptions(): number {
    return this._options.lineWidth;
  }

  private determineLineColorFromOptions(): THREE.Color {
    return this._options.color;
  }

  private pointerTo3DPosition(offsetX: number, offsetY: number) {
    const position = new THREE.Vector3();
    //Get position based on the mouse pointer X and Y value.
    const mouse = new THREE.Vector2();
    mouse.x = (offsetX / this._domElement.clientWidth) * 2 - 1;
    mouse.y = -(offsetY / this._domElement.clientHeight) * 2 + 1;

    const direction = new THREE.Vector3();
    const ray = new THREE.Ray();
    const origin = new THREE.Vector3();

    //Set the origin of the Ray to camera.
    origin.setFromMatrixPosition(this._camera.matrixWorld);
    ray.origin.copy(origin);
    //Calculate the camera direction.
    direction.set(mouse.x, mouse.y, 0.5).unproject(this._camera).sub(ray.origin).normalize();
    ray.direction.copy(direction);
    //Note: Using the initial/start point as reference for ray to emit till that distance from camera.
    ray.at(this._distanceToCamera, position);

    return position;
  }

  /**
   * To enable/disable X, Y, Z axis component of the measurement.
   * @param options MeasurementLineOptions to enable/disable axes components.
   */
  showAxesComponent(enable: boolean): void {
    if (this._axesMesh.length > 0) {
      this._axesMesh.forEach(mesh => {
        mesh.visible = enable;
      });
    }

    // this._axesLabelOpacity = (options.axesComponents === true ? 1.0 : 0.0).toString();
    this._axesHtmlOverlay.visible(enable);
  }

  /**
   * Set the measurement data.
   * @param options Callback function which get user value to be added into label.
   */
  private getMeasurementLabelValue(options: DistanceToLabelDelegate, distance: number) {
    return options(distance);
  }

  /**
   * Get and add axis components for the point to point measurement
   */
  private addAxisMeasurement() {
    if (this._line) {
      this._axesMesh = this._line.getAxisLines();
      this._axesMesh.forEach(mesh => {
        this._viewer.addObject3D(mesh);
      });
      this.addAxisLabels();
      this.showAxesComponent(this._options.axesComponentsVisible);
    }
  }

  private createAxesLabels(position: THREE.Vector3, label: string) {
    const element = this._measurementLabel.createLabel(label);
    this._axesHtmlOverlay.add(element, position);

    return element;
  }

  private addAxisLabels() {
    if (this._measurementLabel) {
      const axisDistanceValues = this._line?.getAxisDistances();
      const xAxesLabelElement = this.createAxesLabels(
        this._line!.getAxisMidPoints()[0],
        this.getMeasurementLabelValue(this._options!.distanceToLabelCallback!, Math.abs(axisDistanceValues!.x))
      );
      xAxesLabelElement.style.background = 'rgb(0 255 0 / 0.5)';
      xAxesLabelElement.style.fontSize = '12px';
      this._axesLabelElement.push(xAxesLabelElement);

      const yAxesLabelElement = this.createAxesLabels(
        this._line!.getAxisMidPoints()[1],
        this.getMeasurementLabelValue(this._options!.distanceToLabelCallback!, Math.abs(axisDistanceValues!.y))
      );
      yAxesLabelElement.style.background = 'rgb(0 0 255 / 0.5)';
      yAxesLabelElement.style.fontSize = '12px';
      this._axesLabelElement.push(yAxesLabelElement);

      const zAxesLabelElement = this.createAxesLabels(
        this._line!.getAxisMidPoints()[2],
        this.getMeasurementLabelValue(this._options!.distanceToLabelCallback!, Math.abs(axisDistanceValues!.z))
      );
      zAxesLabelElement.style.background = 'rgb(255 0 0 / 0.5)';
      zAxesLabelElement.style.fontSize = '12px';
      this._axesLabelElement.push(zAxesLabelElement);
    }
  }

  /**
   * Create and return combine ruler icon as HTMLDivElement.
   * @returns HTMLElement.
   */
  private createCombineClusterElement(): HTMLElement {
    const combineElement = document.createElement('div');
    combineElement.className = MeasurementLabels.stylesId;
    combineElement.innerHTML = svg;

    return combineElement;
  }
}
