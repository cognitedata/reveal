/*!
 * Copyright 2022 Cognite AS
 */
import { CadModelBudget, CameraChangeDelegate, Cognite3DViewer } from '@reveal/core';
import debounce from 'lodash/debounce';
import { Cognite3DViewerToolBase } from '../Cognite3DViewerToolBase';

/**
 * Tool that adjusts budget whenever camera is moving to ensure interactive framerates.
 * This tool will only work when {@link Cognite3dViewer} is initialized with {@see Cognite3DViewerOptions.continuousModelStreaming}
 * is set to true.
 *
 * This class is experimental and is not guaranteed to work in the future.
 *
 * @ignore Hide from public docs.
 */
export class AutoCadBudgetTool extends Cognite3DViewerToolBase {
  private readonly _viewer: Cognite3DViewer;
  private _cameraAtEaseCadBudget: CadModelBudget;
  private _cameraMovingCadBudget: CadModelBudget;
  private _isEnabled: boolean = true;

  private readonly _cameraChangedHandler: CameraChangeDelegate;
  private readonly _scheduleResetViewerCadBudget: () => void;

  constructor(viewer: Cognite3DViewer, resetBudgetDelayMs: number = 250) {
    super();
    this._viewer = viewer;
    this._cameraAtEaseCadBudget = { ...viewer.cadBudget };
    this._cameraMovingCadBudget = { ...viewer.cadBudget };
    this._scheduleResetViewerCadBudget = debounce(() => this.resetViewerCadBudget(), resetBudgetDelayMs);

    this._cameraChangedHandler = this.handleCameraChanged.bind(this);
    this._viewer.on('cameraChange', this._cameraChangedHandler);
  }

  dispose(): void {
    this._viewer.off('cameraChange', this._cameraChangedHandler);
    super.dispose();
  }

  get cameraAtEaseCadBudget(): CadModelBudget {
    return this._cameraAtEaseCadBudget;
  }

  set cameraAtEaseCadBudget(budget: CadModelBudget) {
    this._cameraAtEaseCadBudget = budget;
    this.resetViewerCadBudget();
  }

  get cameraMovingCadBudget(): CadModelBudget {
    return this._cameraMovingCadBudget;
  }

  set cameraMovingCadBudget(budget: CadModelBudget) {
    this._cameraMovingCadBudget = budget;
  }

  get isEnabled(): boolean {
    return this._isEnabled;
  }

  set isEnabled(enable: boolean) {
    if (this._isEnabled === enable) {
      return;
    }

    this._isEnabled = enable;
    if (!enable) {
      this.resetViewerCadBudget();
    }
  }

  private handleCameraChanged() {
    this._viewer.cadBudget = this._cameraMovingCadBudget;
    this._scheduleResetViewerCadBudget();
  }

  private resetViewerCadBudget() {
    this._viewer.cadBudget = this._cameraAtEaseCadBudget;
  }
}
