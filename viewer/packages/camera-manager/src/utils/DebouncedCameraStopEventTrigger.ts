/*!
 * Copyright 2022 Cognite AS
 */

import { CameraManager } from '../CameraManager';
import { CameraStopDelegate } from '../types';

import debounce from 'lodash/debounce';
import { EventTrigger } from '@reveal/utilities';

export class DebouncedCameraStopEventTrigger {
  private readonly _debouncedFireEvent: () => void;
  private readonly _cameraManager: CameraManager;

  private readonly _trigger: EventTrigger<CameraStopDelegate>;

  constructor(cameraManager: CameraManager, debounceTimeMs: number = 100) {
    this._trigger = new EventTrigger();

    this._debouncedFireEvent = debounce(() => this._trigger.fire(), debounceTimeMs);
    this._cameraManager = cameraManager;

    this._cameraManager.on('cameraChange', this._debouncedFireEvent);
  }

  subscribe(callback: CameraStopDelegate): void {
    this._trigger.subscribe(callback);
  }

  unsubscribe(callback: CameraStopDelegate): void {
    this._trigger.unsubscribe(callback);
  }

  dispose(): void {
    this._trigger.unsubscribeAll();
    this._cameraManager.off('cameraChange', this._debouncedFireEvent);
  }
}
