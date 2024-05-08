/*!
 * Copyright 2022 Cognite AS
 */

import { Cognite3DViewer } from '@reveal/api';
import { Cognite3DViewerToolBase } from '../Cognite3DViewerToolBase';
import { assertNever, DisposedDelegate, EventTrigger } from '@reveal/utilities';
import * as THREE from 'three';
import {
  MeasurementAddedDelegate,
  MeasurementStartedDelegate,
  MeasurementEndedDelegate,
  MeasurementOptions,
  Measurement
} from './types';
import { MeasurementManager } from './MeasurementManager';
import { MeasurementLabels } from './MeasurementLabels';
import { HtmlOverlayTool, HtmlOverlayToolOptions } from '../HtmlOverlay/HtmlOverlayTool';
import rulerSvg from '!!raw-loader!./styles/ruler.svg';
import { MetricsLogger } from '@reveal/metrics';
import { FlexibleCameraManager } from '@reveal/camera-manager';

type MeasurementEvents = 'added' | 'started' | 'ended' | 'disposed';

/**
 * Enables {@link Cognite3DViewer} to perform a point to point measurement.
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
 * const measurementTool = new MeasurementTool(viewer, {distanceToLabelCallback: (distanceInMeters) => {
 *    // 1 meters = 3.281 feet
 *    const distancesInFeet = distanceInMeters * 3.281;
 *    return { distanceInMeters: distancesInFeet, units: 'ft'};
 *  }});
 *  measurementTool.enterMeasurementMode();
```
 */
export class MeasurementTool extends Cognite3DViewerToolBase {
  /**
   * Returns measurement mode state, is measurement mode started or ended.
   */
  get isInMeasurementMode(): boolean {
    return this._measurementMode;
  }

  private _options: Required<MeasurementOptions>;
  private readonly _viewer: Cognite3DViewer;
  private readonly _geometryGroup = new THREE.Group();
  private readonly _measurements: MeasurementManager[];
  private _activeMeasurement: MeasurementManager | undefined;
  private readonly _htmlOverlay: HtmlOverlayTool;
  private _measurementMode: boolean;
  private _showMeasurements: boolean;
  private _showLabels: boolean;

  private readonly _handleLabelClustering = this.createCombineClusterElement.bind(this);
  private readonly _handlePointerClick = this.onPointerClick.bind(this);
  private readonly _handlePointerMove = this.onPointerMove.bind(this);
  private readonly _handleMeasurementCancel = this.onKeyDown.bind(this);
  private readonly _handleClippingPlanes = this.onClipping.bind(this);

  private readonly _events = {
    measurementAdded: new EventTrigger<MeasurementAddedDelegate>(),
    measurementStarted: new EventTrigger<MeasurementStartedDelegate>(),
    measurementEnded: new EventTrigger<MeasurementEndedDelegate>(),
    disposed: new EventTrigger<DisposedDelegate>()
  };

  private readonly _overlayOptions: HtmlOverlayToolOptions = {
    clusteringOptions: { mode: 'overlapInScreenSpace', createClusterElementCallback: this._handleLabelClustering }
  };

  private static readonly defaultLineOptions: Required<MeasurementOptions> = {
    distanceToLabelCallback: d => MeasurementTool.metersLabelCallback(d),
    lineWidth: 0.01,
    color: new THREE.Color(0xff8746)
  };

  constructor(viewer: Cognite3DViewer, options?: MeasurementOptions) {
    super();
    this._viewer = viewer;
    this._options = {
      ...MeasurementTool.defaultLineOptions,
      ...options
    };
    this._measurements = [];
    this._measurementMode = false;
    this._showMeasurements = this._showLabels = true;
    this._htmlOverlay = new HtmlOverlayTool(this._viewer, this._overlayOptions);

    this._geometryGroup.name = MeasurementTool.name;
    this._viewer.addObject3D(this._geometryGroup);

    MetricsLogger.trackCreateTool('MeasurementTool');
  }

  /**
   * Triggered when the tool is disposed. Listeners should clean up any
   * resources held and remove the reference to the tool.
   * @example
   * ```js
   * measurementTool.on('disposed', onMeasurementDispose);
   * ```
   */
  on(event: 'disposed', callback: DisposedDelegate): void;

  /**
   * Triggered when a measurement is added into the Cognite3DViewer.
   * @example
   * ```js
   * measurementTool.on('added', onMeasurementAdded);
   * ```
   */
  on(event: 'added', callback: MeasurementAddedDelegate): void;

  /**
   * Triggered when a measurement mode is started.
   * @example
   * ```js
   * measurementTool.on('started', onMeasurementStarted);
   * ```
   */
  on(event: 'started', callback: MeasurementStartedDelegate): void;

  /**
   * Triggered when measurement mode is ended.
   * @example
   * ```js
   * measurementTool.on('ended', onMeasurementEnded);
   * ```
   */
  on(event: 'ended', callback: MeasurementEndedDelegate): void;

  /**
   * Subscribe to the Measurement events
   * @param event `MeasurementEvents` event
   * @param callback Callback to measurements events
   */
  on(
    event: MeasurementEvents,
    callback: MeasurementAddedDelegate | MeasurementStartedDelegate | MeasurementEndedDelegate | DisposedDelegate
  ): void {
    switch (event) {
      case 'added':
        this._events.measurementAdded.subscribe(callback as MeasurementAddedDelegate);
        break;
      case 'started':
        this._events.measurementStarted.subscribe(callback as MeasurementStartedDelegate);
        break;
      case 'ended':
        this._events.measurementEnded.subscribe(callback as MeasurementEndedDelegate);
        break;
      case 'disposed':
        this._events.disposed.subscribe(callback as DisposedDelegate);
        break;
      default:
        assertNever(event, `Unsupported event: '${event}'`);
    }
  }

  /**
   * @example
   * ```js
   * measurementTool.off('disposed', onMeasurementDispose);
   * ```
   */
  off(event: 'disposed', callback: DisposedDelegate): void;

  /**
   * @example
   * ```js
   * measurementTool.off('added', onMeasurementAdded);
   * ```
   */
  off(event: 'added', callback: MeasurementAddedDelegate): void;

  /**
   * @example
   * ```js
   * measurementTool.off('started', onMeasurementStarted);
   * ```
   */
  off(event: 'started', callback: MeasurementStartedDelegate): void;

  /**
   * @example
   * ```js
   * measurementTool.off('ended', onMeasurementEnded);
   * ```
   */
  off(event: 'ended', callback: MeasurementEndedDelegate): void;

  /**
   * Unsubscribe to the Measurement event
   * @param event `MeasurementEvents` event
   * @param callback Callback to measurements events
   */
  off(
    event: MeasurementEvents,
    callback: MeasurementAddedDelegate | MeasurementStartedDelegate | MeasurementEndedDelegate | DisposedDelegate
  ): void {
    switch (event) {
      case 'added':
        this._events.measurementAdded.unsubscribe(callback as MeasurementAddedDelegate);
        break;
      case 'started':
        this._events.measurementStarted.unsubscribe(callback as MeasurementStartedDelegate);
        break;
      case 'ended':
        this._events.measurementEnded.unsubscribe(callback as MeasurementEndedDelegate);
        break;
      case 'disposed':
        this._events.disposed.unsubscribe(callback as DisposedDelegate);
        break;
      default:
        assertNever(event, `Unsupported event: '${event}'`);
    }
  }

  /**
   * Enter into point to point measurement mode.
   */
  enterMeasurementMode(): void {
    if (this._measurementMode) {
      throw new Error('Measurement mode is active, call exitMeasurementMode()');
    }
    this._viewer.on('click', this._handlePointerClick);
    this._viewer.on('beforeSceneRendered', this._handleClippingPlanes);
    this._events.measurementStarted.fire();
    this._measurementMode = true;
    this._showMeasurements = true;

    if (this._viewer.cameraManager instanceof FlexibleCameraManager) {
      this._viewer.cameraManager.isEnableClickAndDoubleClick = false;
    }
  }

  /**
   * Exit measurement mode.
   */
  exitMeasurementMode(): void {
    if (!this._measurementMode) {
      throw new Error('Measurement mode is not active, call enterMeasurementMode()');
    }
    this.cancelActiveMeasurement();
    this._viewer.off('click', this._handlePointerClick);
    this._viewer.off('beforeSceneRendered', this._handleClippingPlanes);
    this._events.measurementEnded.fire();
    this._measurementMode = false;
    if (this._viewer.cameraManager instanceof FlexibleCameraManager) {
      this._viewer.cameraManager.isEnableClickAndDoubleClick = true;
    }
  }

  /**
   * Removes a measurement from the Cognite3DViewer.
   * @param measurement Measurement to be removed from Cognite3DViewer.
   */
  removeMeasurement(measurement: Measurement): void {
    const index = this._measurements.findIndex(
      measurementManager => measurementManager.getMeasurement() === measurement
    );
    if (index === -1) {
      throw new Error('Measurement not found');
    }
    this._measurements[index].removeMeasurement();
    this._measurements.splice(index, 1);
    this._viewer.requestRedraw();
  }

  /**
   * Adds a measurement directly. E.g. to restore a previous state programatically
   */
  addMeasurement(startPoint: THREE.Vector3, endPoint: THREE.Vector3): Measurement {
    const measurementManager = new MeasurementManager(
      this._viewer.domElement,
      this._viewer.cameraManager.getCamera(),
      this._geometryGroup,
      this._options,
      this._htmlOverlay,
      startPoint
    );
    measurementManager.endMeasurement(endPoint);

    this._measurements.push(measurementManager);
    const measurement = measurementManager.getMeasurement();
    this._events.measurementAdded.fire(measurement);
    return measurement;
  }

  /**
   * Removes all measurements from the Cognite3DViewer.
   */
  removeAllMeasurements(): void {
    //clear all mesh, geometry & labels.
    this._measurements.forEach(measurement => {
      measurement.removeMeasurement();
    });
    this._measurements.splice(0);
    this._viewer.requestRedraw();
  }

  /**
   * Sets the visiblity of labels in the Measurement.
   * @param enable
   */
  setMeasurementLabelsVisible(enable: boolean): void {
    if (this._showMeasurements) {
      this._htmlOverlay.visible(enable);
    }
    this._showLabels = enable;
  }

  /**
   * Sets Measurement line width, color and label units value for the next measurment.
   * @param options MeasurementOptions to set line width, color and callback for custom operation on measurement labels.
   */
  setLineOptions(options: MeasurementOptions): void {
    this._options = {
      ...this._options,
      ...options
    };
  }

  /**
   * Update selected line width.
   * @param measurement Measurement to be updated.
   * @param lineWidth Width of the measuring line.
   */
  updateLineWidth(measurement: Measurement, lineWidth: number): void {
    const index = this._measurements.findIndex(
      measurementManager => measurementManager.getMeasurement() === measurement
    );
    if (index === -1) {
      throw new Error('Measurement not found');
    }
    this._measurements[index].updateLineWidth(lineWidth);
    this._viewer.requestRedraw();
  }

  /**
   * Update selected line color.
   * @param measurement Measurement to be updated.
   * @param color Color of the measuring line.
   */
  updateLineColor(measurement: Measurement, color: THREE.Color): void {
    const index = this._measurements.findIndex(
      measurementManager => measurementManager.getMeasurement() === measurement
    );
    if (index === -1) {
      throw new Error('Measurement not found');
    }
    this._measurements[index].updateLineColor(color);
    this._viewer.requestRedraw();
  }

  /**
   * Get all measurements from {@link Cognite3DViewer}.
   * @returns Array of Measurements containing Id, start point, end point & measured distance.
   */
  getAllMeasurements(): Measurement[] {
    return this._measurements.map(measurement => measurement.getMeasurement());
  }

  /**
   * Hide/unhide all measurements
   * @param enable
   */
  visible(enable: boolean): void {
    this._measurements.forEach(measurement => {
      measurement.visible(enable);
    });
    const showLabels = enable === false ? false : this._showLabels;
    this._htmlOverlay.visible(showLabels);
    this._showMeasurements = enable;
    this._viewer.requestRedraw();
  }

  /**
   * Dispose Measurement Tool.
   */
  dispose(): void {
    this.removeAllMeasurements();
    this.exitMeasurementMode();
    this._activeMeasurement?.removeMeasurement();
    this._htmlOverlay.dispose();
    this._geometryGroup.clear();
    this._viewer.removeObject3D(this._geometryGroup);
    this._events.measurementAdded.unsubscribeAll();
    this._events.measurementStarted.unsubscribeAll();
    this._events.measurementEnded.unsubscribeAll();
    super.dispose();
  }

  private async onPointerClick(event: { offsetX: number; offsetY: number }): Promise<void> {
    const { offsetX, offsetY } = event;

    const intersection = await this._viewer.getIntersectionFromPixel(offsetX, offsetY);

    if (!intersection) {
      return;
    }

    if (!this._activeMeasurement) {
      const camera = this._viewer.cameraManager.getCamera();
      const domElement = this._viewer.domElement;
      this._activeMeasurement = new MeasurementManager(
        domElement,
        camera,
        this._geometryGroup,
        this._options,
        this._htmlOverlay,
        intersection.point
      );
      this._viewer.domElement.addEventListener('pointermove', this._handlePointerMove);
      this._viewer.domElement.addEventListener('keydown', this._handleMeasurementCancel);
    } else {
      this._activeMeasurement.endMeasurement(intersection.point);
      const measurement = this._activeMeasurement.getMeasurement();

      this._measurements.push(this._activeMeasurement);
      this._activeMeasurement = undefined;
      // To avoid issue when exiting measurement mode when a measurement 'added' event called
      this._events.measurementAdded.fire(measurement);
      this._viewer.domElement.removeEventListener('pointermove', this._handlePointerMove);
      this._viewer.domElement.removeEventListener('keydown', this._handleMeasurementCancel);

      MetricsLogger.trackEvent('measurementAdded', { measurement });
    }
    this._viewer.requestRedraw();
  }

  private onPointerMove(event: { offsetX: number; offsetY: number }) {
    if (this._activeMeasurement) {
      this._activeMeasurement!.update(event);
      this._viewer.requestRedraw();
    }
  }

  /**
   * Create and return combine ruler icon as HTMLDivElement.
   * @returns HTMLDivElement.
   */
  private createCombineClusterElement() {
    // TODO 2022-07-05 larsmoa: Move all ownership of labels here - currently responsibility is split
    // between several classes which is *bad*
    // pramodcog: as clustering is related to tool, it would be ideal to have it here.
    const combineElement = document.createElement('div');
    combineElement.className = MeasurementLabels.stylesId;
    combineElement.innerHTML = rulerSvg;

    return combineElement;
  }

  private static metersLabelCallback(distanceInMeters: number): string {
    return `${distanceInMeters.toFixed(2)} m`;
  }

  /**
   * To cancel an active measurement `Escape` key is processed and remove all its related data & events.
   * @param event Keyboard event to process for `Escape` key
   */
  private onKeyDown(event: KeyboardEvent) {
    if (event.metaKey || event.altKey || event.ctrlKey) {
      return;
    }

    if (event.key === 'Escape') {
      //Cancel active measurement
      this.cancelActiveMeasurement();
      event.preventDefault();
    }
  }

  /**
   * Cancel the active measurement.
   */
  private cancelActiveMeasurement() {
    if (this._activeMeasurement) {
      this._activeMeasurement.removeMeasurement();
      this._activeMeasurement = undefined;
      this._viewer.requestRedraw();
      this._viewer.domElement.removeEventListener('pointermove', this._handlePointerMove);
    }
  }

  private onClipping() {
    const clippingPlanes = this._viewer.getGlobalClippingPlanes();
    this._measurements.forEach(measurement => {
      measurement.updateLineClippingPlanes(clippingPlanes);
    });
  }
}
