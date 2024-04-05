/*!
 * Copyright 2024 Cognite AS
 */

import { FlexibleControls } from './FlexibleControls';
import { EventTrigger, assertNever } from '@reveal/utilities';
import { CameraChangeDelegate, CameraEventDelegate, CameraManagerEventType, CameraStopDelegate } from '../types';
import { FlexibleControlsTypeChangeDelegate } from './IFlexibleCameraManager';
import debounce from 'lodash/debounce';

const DEBOUNCE_TIME_MS = 100;

export class FlexibleCameraListeners {
  //================================================
  // INSTANCE FIELDS:
  //================================================

  private readonly _controlsTypeChangeEvents = new EventTrigger<FlexibleControlsTypeChangeDelegate>();
  private readonly _cameraChangeEvents = new EventTrigger<CameraChangeDelegate>();
  private readonly _cameraStopEvents = new EventTrigger<CameraStopDelegate>();
  private readonly _debouncedCameraChange = debounce(() => this._cameraStopEvents.fire(), DEBOUNCE_TIME_MS);

  //================================================
  // INSTANCE FIELDS:
  //================================================

  constructor() {
    this._cameraChangeEvents.subscribe(this._debouncedCameraChange);
  }

  //================================================
  // INSTANCE METHODS:
  //================================================

  public dispose(): void {
    this._controlsTypeChangeEvents.unsubscribeAll();
    this._cameraChangeEvents.unsubscribeAll();
    this._cameraStopEvents.unsubscribeAll();
  }

  public addControlsTypeChangeListener(callback: FlexibleControlsTypeChangeDelegate): void {
    this._controlsTypeChangeEvents.subscribe(callback);
  }

  public removeControlsTypeChangeListener(callback: FlexibleControlsTypeChangeDelegate): void {
    this._controlsTypeChangeEvents.unsubscribe(callback);
  }

  public onControlsTypeChange(controls: FlexibleControls): void {
    this._controlsTypeChangeEvents.fire(controls.controlsType);
  }

  public onCameraChangeEventsChange(controls: FlexibleControls): void {
    this._cameraChangeEvents.fire(controls.getPosition(), controls.getTarget());
  }

  public on(event: CameraManagerEventType, callback: CameraEventDelegate): void {
    switch (event) {
      case 'cameraChange':
        this._cameraChangeEvents.subscribe(callback as CameraChangeDelegate);
        break;
      case 'cameraStop':
        this._cameraStopEvents.subscribe(callback as CameraStopDelegate);
        break;
      default:
        assertNever(event);
    }
  }

  public off(event: CameraManagerEventType, callback: CameraEventDelegate): void {
    switch (event) {
      case 'cameraChange':
        this._cameraChangeEvents.unsubscribe(callback as CameraChangeDelegate);
        break;
      case 'cameraStop':
        this._cameraStopEvents.unsubscribe(callback as CameraStopDelegate);
        break;
      default:
        assertNever(event);
    }
  }
}
