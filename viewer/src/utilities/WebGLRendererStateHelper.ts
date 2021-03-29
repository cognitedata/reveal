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

  setClearColor(color: THREE.Color | number | string) {
    this._originalState = { clearColor: this._renderer.getClearColor().clone(), ...this._originalState };
    this._renderer.setClearColor(color);
  }

  setClearAlpha(alpha: number) {
    this._originalState = { clearAlpha: this._renderer.getClearAlpha(), ...this._originalState };
    this._renderer.setClearAlpha(alpha);
  }

  setSize(width: number, height: number) {
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

  setRenderTarget(renderTarget: THREE.WebGLRenderTarget | null) {
    this._originalState = { renderTarget, ...this._originalState };
    this._renderer.setRenderTarget(renderTarget);
  }

  resetState() {
    if (this._originalState.autoClear !== undefined) {
      this._renderer.autoClear = this._originalState.autoClear;
    }
    if (this._originalState.clearColor !== undefined) {
      this._renderer.setClearColor(this._originalState.clearColor);
    }
    if (this._originalState.clearAlpha !== undefined) {
      this._renderer.setClearAlpha(this._originalState.clearAlpha);
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
