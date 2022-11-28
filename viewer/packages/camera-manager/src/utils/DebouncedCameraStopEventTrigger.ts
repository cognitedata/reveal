/*!
 * Copyright 2022 Cognite AS
 */

import { CameraManager } from '../CameraManager';
import { CameraStopDelegate } from '../types';

import debounce from 'lodash/debounce';
import { EventTrigger } from '@reveal/utilities';

export class DebouncedCameraStopEventTrigger extends EventTrigger<CameraStopDelegate> {
  private readonly _debouncedFireEvent: () => void;
  private readonly _cameraManager: CameraManager;

  constructor(cameraManager: CameraManager, debounceTimeMs: number = 100) {
    super();
    this._debouncedFireEvent = debounce(() => this.fire(), debounceTimeMs);
    this._cameraManager = cameraManager;

    this._cameraManager.on('cameraChange', this._debouncedFireEvent);
  }

  dispose(): void {
    super.unsubscribeAll();
    this._cameraManager.off('cameraChange', this._debouncedFireEvent);
  }
}
