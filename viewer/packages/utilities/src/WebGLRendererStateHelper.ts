/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

type WebGLRendererState = {
  autoClear?: boolean;
  clearColor?: THREE.Color | string | number;
  clearAlpha?: number;
  size?: THREE.Vector2;
  localClippingEnabled?: boolean;
  renderTarget?: THREE.WebGLRenderTarget | null;
};

export class WebGLRendererStateHelper {
  private _originalState: WebGLRendererState = {};
  private readonly _renderer: THREE.WebGLRenderer;

  constructor(renderer: THREE.WebGLRenderer) {
    this._renderer = renderer;
    this._originalState = {};
  }

  setClearColor(color: THREE.Color | number | string, alpha?: number): void {
    this._originalState = {
      clearColor: this._renderer.getClearColor(new THREE.Color()),
      clearAlpha: this._renderer.getClearAlpha(),
      ...this._originalState
    };
    this._renderer.setClearColor(color, alpha);
  }

  setSize(width: number, height: number): void {
    this._originalState = { size: this._renderer.getSize(new THREE.Vector2()), ...this._originalState };
    this._renderer.setSize(width, height);
  }

  set localClippingEnabled(enabled: boolean) {
    this._originalState = { localClippingEnabled: this._renderer.localClippingEnabled, ...this._originalState };
    this._renderer.localClippingEnabled = enabled;
  }

  set autoClear(enabled: boolean) {
    this._originalState = { autoClear: this._renderer.autoClear, ...this._originalState };
    this._renderer.autoClear = enabled;
  }

  setRenderTarget(renderTarget: THREE.WebGLRenderTarget | null): void {
    this._originalState = { renderTarget: this._renderer.getRenderTarget(), ...this._originalState };
    this._renderer.setRenderTarget(renderTarget);
  }

  resetState(): void {
    if (this._originalState.autoClear !== undefined) {
      this._renderer.autoClear = this._originalState.autoClear;
    }
    if (this._originalState.clearColor !== undefined) {
      this._renderer.setClearColor(this._originalState.clearColor, this._originalState.clearAlpha);
    }
    if (this._originalState.localClippingEnabled !== undefined) {
      this._renderer.localClippingEnabled = this._originalState.localClippingEnabled;
    }
    if (this._originalState.size !== undefined) {
      this._renderer.setSize(this._originalState.size.width, this._originalState.size.height);
    }
    if (this._originalState.renderTarget !== undefined) {
      this._renderer.setRenderTarget(this._originalState.renderTarget);
    }

    this._originalState = {};
  }
}
