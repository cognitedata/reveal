/*!
 * Copyright 2026 Cognite AS
 */

import type { RenderTarget, WebGLRenderTarget } from 'three';
import { Color, Vector2, Vector4 } from 'three';

import { isWebGPURenderer, type RevealRenderer } from '../rendering/RevealRenderer';

type RendererState = {
  autoClear?: boolean;
  autoClearDepth?: boolean;
  clearColor?: Color;
  clearAlpha?: number;
  size?: Vector2;
  localClippingEnabled?: boolean;
  renderTarget?: RenderTarget | null;
  scissorData?: Vector4;
  scissorTest?: boolean;
};

export class RevealRendererStateHelper {
  private _originalState: RendererState = {};
  private readonly _renderer: RevealRenderer;

  constructor(renderer: RevealRenderer) {
    this._renderer = renderer;
  }

  setScissor(x: number, y: number, width: number, height: number): void {
    const scissorData = this._renderer.getScissor(new Vector4());
    this._originalState = { scissorData, ...this._originalState };
    this._renderer.setScissor(x, y, width, height);
  }

  setScissorTest(enabled: boolean): void {
    this._originalState = { scissorTest: this._renderer.getScissorTest(), ...this._originalState };
    this._renderer.setScissorTest(enabled);
  }

  setClearColor(color: Color | number, alpha?: number): void {
    this._originalState = {
      clearColor: this._renderer.getClearColor(new Color()),
      clearAlpha: this._renderer.getClearAlpha(),
      ...this._originalState
    };
    this._renderer.setClearColor(color, alpha);
  }

  setSize(width: number, height: number): void {
    this._originalState = { size: this._renderer.getSize(new Vector2()), ...this._originalState };
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

  set autoClearDepth(enabled: boolean) {
    this._originalState = { autoClearDepth: this._renderer.autoClearDepth, ...this._originalState };
    this._renderer.autoClearDepth = enabled;
  }

  setRenderTarget(renderTarget: RenderTarget | null): void {
    this._originalState = { renderTarget: this._renderer.getRenderTarget(), ...this._originalState };
    this._renderer.setRenderTarget(renderTarget);
  }

  setWebGLState(state: { buffers?: { depth?: { mask?: boolean; test?: boolean } } }): void {
    if (isWebGPURenderer(this._renderer) && !('forceWebGL' in this._renderer)) {
      return;
    }
    const webglRenderer = this._renderer as unknown as {
      state: { buffers: { depth: { setMask: (v: boolean) => void; setTest: (v: boolean) => void } } };
    };
    if (state?.buffers?.depth?.mask !== undefined) {
      webglRenderer.state.buffers.depth.setMask(state.buffers.depth.mask);
    }
    if (state?.buffers?.depth?.test !== undefined) {
      webglRenderer.state.buffers.depth.setTest(state.buffers.depth.test);
    }
  }

  resetState(): void {
    if (this._originalState.autoClear !== undefined) {
      this._renderer.autoClear = this._originalState.autoClear;
    }
    if (this._originalState.autoClearDepth !== undefined) {
      this._renderer.autoClearDepth = this._originalState.autoClearDepth;
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
      this._renderer.setRenderTarget(this._originalState.renderTarget as WebGLRenderTarget | null);
    }
    if (this._originalState.scissorData !== undefined) {
      this._renderer.setScissor(this._originalState.scissorData);
    }
    if (this._originalState.scissorTest !== undefined) {
      this._renderer.setScissorTest(this._originalState.scissorTest);
    }
    this._originalState = {};
  }
}
