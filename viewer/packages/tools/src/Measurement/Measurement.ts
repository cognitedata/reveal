/*!
 * Copyright 2022 Cognite AS
 */

import { Cognite3DViewer, Intersection } from '@reveal/api';
import * as THREE from 'three';
import { HtmlOverlayTool, HtmlOverlayToolOptions } from '../HtmlOverlay/HtmlOverlayTool';
import { MeasurementLabels } from './MeasurementLabels';
import { MeasurementLine } from './MeasurementLine';
import { MeasurementOptions, MeasurementLabelUpdateDelegate, MeasurementLabelData } from './types';
import svg from '!!raw-loader!./styles/ruler.svg';

export class Measurement {
  private readonly _viewer: Cognite3DViewer;
  private readonly _measurementLabel: MeasurementLabels;
  private readonly _line: MeasurementLine;
  private _axesMesh: THREE.Mesh[];
  private _lineMesh: THREE.Group | null;
  private readonly _options: MeasurementOptions | undefined;
  private readonly _domElement: HTMLElement;
  private readonly _camera: THREE.Camera;
  private readonly _htmlOverlay: HtmlOverlayTool;
  private _labelElement: HTMLDivElement | null;
  private readonly _axesHtmlOverlay: HtmlOverlayTool;
  private readonly _axesLabelElement: HTMLDivElement[];

  private readonly _handleLabelClustering = this.createCombineClusterElement.bind(this);
  private readonly _overlayOptions: HtmlOverlayToolOptions = {
    clusteringOptions: { mode: 'overlapInScreenSpace', createClusterElementCallback: this._handleLabelClustering }
  };

  constructor(viewer: Cognite3DViewer, options: MeasurementOptions, overlay: HtmlOverlayTool) {
    this._viewer = viewer;
    this._options = options;
    this._lineMesh = null;
    this._axesMesh = [];
    this._line = new MeasurementLine(this._options);
    this._measurementLabel = new MeasurementLabels();
    this._htmlOverlay = overlay;
    this._labelElement = null;
    this._axesHtmlOverlay = new HtmlOverlayTool(viewer, this._overlayOptions);
    this._axesLabelElement = [];
    this._domElement = this._viewer.domElement;
    this._camera = this._viewer.getCamera();
  }

  /**
   * Start the measurement.
   * @param intersection Intersection Object containing point & camera distance.
   */
  startMeasurement(intersection: Intersection): void {
    //Clear the line objects if exists for new line.
    this._line.clearObjects();
    this._lineMesh = this._line.startLine(intersection.point, intersection.distanceToCamera);
    this._viewer.addObject3D(this._lineMesh!);
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
    this._line.updateLine(0, 0, this._domElement, this._camera, point);
    const distanceValue = this.getMeasurementLabelValue(
      this._options!.changeMeasurementLabelMetrics!,
      this._line.getMeasuredDistance()
    );
    //Add the measurement label.
    this._labelElement = this.addLabel(this._line.getMidPointOnLine(), distanceValue);

    // if (this._options?.axisComponents) {
    this.addAxisMeasurement();
    // }
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
    //Remove Measurement line & label
    if (this._lineMesh) {
      this._viewer.removeObject3D(this._lineMesh);
    }

    if (this._htmlOverlay && this._labelElement) {
      this._htmlOverlay.remove(this._labelElement!);
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
  getMesh(): THREE.Group | null {
    return this._lineMesh;
  }

  /**
   * To enable/disable X, Y, Z axis component of the measurement.
   * @param options MeasurementLineOptions to enable/disable axes components.
   */
  showAxesComponent(options: MeasurementOptions): void {
    if (this._axesMesh.length > 0) {
      this._axesMesh.forEach(mesh => {
        mesh.visible = options.axesComponents!;
      });
    }

    // this._axesLabelOpacity = (options.axesComponents === true ? 1.0 : 0.0).toString();
    this._axesHtmlOverlay.visible(options.axesComponents!);
  }

  /**
   * Set the measurement data.
   * @param options Callback function which get user value to be added into label.
   */
  private getMeasurementLabelValue(options: MeasurementLabelUpdateDelegate, distance: number) {
    const measurementLabelData = options(distance);
    return measurementLabelData?.distance?.toFixed(2) + ' ' + measurementLabelData?.units;
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
    }
  }

  private createAxesLabels(position: THREE.Vector3, label: string) {
    const element = this._measurementLabel.createLabel(label);
    this._axesHtmlOverlay.add(element, position);

    return element;
  }

  private addAxisLabels() {
    if (this._measurementLabel) {
      const axisDistanceValues = this._line.getAxisDistances();
      this._axesLabelElement.push(
        this.createAxesLabels(
          this._line.getAxisMidPoints()[0],
          this.getMeasurementLabelValue(this._options!.changeMeasurementLabelMetrics!, Math.abs(axisDistanceValues.x))
        )
      );
      this._axesLabelElement.push(
        this.createAxesLabels(
          this._line.getAxisMidPoints()[1],
          this.getMeasurementLabelValue(this._options!.changeMeasurementLabelMetrics!, Math.abs(axisDistanceValues.y))
        )
      );
      this._axesLabelElement.push(
        this.createAxesLabels(
          this._line.getAxisMidPoints()[2],
          this.getMeasurementLabelValue(this._options!.changeMeasurementLabelMetrics!, Math.abs(axisDistanceValues.z))
        )
      );
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
