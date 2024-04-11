/*!
 * Copyright 2024 Cognite AS
 */

import { FlexibleControls } from './FlexibleControls';
import { EventTrigger, assertNever } from '@reveal/utilities';
import { CameraChangeDelegate, CameraEventDelegate, CameraManagerEventType, CameraStopDelegate } from '../types';
import { FlexibleControlsTypeChangeDelegate } from './IFlexibleCameraManager';
import debounce from 'lodash/debounce';

const DEBOUNCE_TIME_MS = 100;

type FlexibleCameraManagerEventType = CameraManagerEventType | 'controlsTypeChange';
type FlexibleCameraEventDelegate = CameraEventDelegate | FlexibleControlsTypeChangeDelegate;

export class FlexibleCameraEventTarget {
  //================================================
  // INSTANCE FIELDS:
  //================================================

  private readonly _controlsTypeChangeListeners = new EventTrigger<FlexibleControlsTypeChangeDelegate>();
  private readonly _cameraChangeListeners = new EventTrigger<CameraChangeDelegate>();
  private readonly _cameraStopListeners = new EventTrigger<CameraStopDelegate>();
  private readonly _debouncedCameraListener = debounce(() => this._cameraStopListeners.fire(), DEBOUNCE_TIME_MS);

  //================================================
  // CONTRUCTOR:
  //================================================

  constructor() {
    this._cameraChangeListeners.subscribe(this._debouncedCameraListener);
  }

  //================================================
  // INSTANCE METHODS:
  //================================================

  public removeEventListeners(): void {
    this._controlsTypeChangeListeners.unsubscribeAll();
    this._cameraChangeListeners.unsubscribeAll();
    this._cameraStopListeners.unsubscribeAll();
  }

  //================================================
  // INSTANCE METHODS:
  //================================================

  public dispatchEvent(event: FlexibleCameraManagerEventType, controls: FlexibleControls): void {
    switch (event) {
      case 'cameraChange':
        this._cameraChangeListeners.fire(controls.camera.position.clone(), controls.getTarget());
        break;
      case 'cameraStop':
        this._cameraStopListeners.fire();
        break;
      case 'controlsTypeChange':
        this._controlsTypeChangeListeners.fire(controls.controlsType);
        break;
      default:
        assertNever(event);
    }
  }

  public addEventListener(event: FlexibleCameraManagerEventType, callback: FlexibleCameraEventDelegate): void {
    switch (event) {
      case 'cameraChange':
        this._cameraChangeListeners.subscribe(callback as CameraChangeDelegate);
        break;
      case 'cameraStop':
        this._cameraStopListeners.subscribe(callback as CameraStopDelegate);
        break;
      case 'controlsTypeChange':
        this._controlsTypeChangeListeners.subscribe(callback as FlexibleControlsTypeChangeDelegate);
        break;
      default:
        assertNever(event);
    }
  }

  public removeEventListener(event: FlexibleCameraManagerEventType, callback: FlexibleCameraEventDelegate): void {
    switch (event) {
      case 'cameraChange':
        this._cameraChangeListeners.unsubscribe(callback as CameraChangeDelegate);
        break;
      case 'cameraStop':
        this._cameraStopListeners.unsubscribe(callback as CameraStopDelegate);
        break;
      case 'controlsTypeChange':
        this._controlsTypeChangeListeners.unsubscribe(callback as FlexibleControlsTypeChangeDelegate);
        break;
      default:
        assertNever(event);
    }
  }
}
