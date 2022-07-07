/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import { Vector4 } from 'three';

type WebGLRendererState = {
  autoClear?: boolean;
  clearColor?: THREE.Color | string | number;
  clearAlpha?: number;
  size?: THREE.Vector2;
  localClippingEnabled?: boolean;
  renderTarget?: THREE.WebGLRenderTarget | null;
  scissorData?: THREE.Vector4;
  scissorTest?: boolean;
  webGLState?: WebGLState;
};

type WebGLState = {
  buffers?: {
    depth?: {
      mask?: boolean;
      test?: boolean;
    };
  };
};

export class WebGLRendererStateHelper {
  private _originalState: WebGLRendererState = {};
  private readonly _renderer: THREE.WebGLRenderer;

  private static DefaultWebGLState: WebGLState = {
    buffers: {
      depth: {
        mask: true,
        test: true
      }
    }
  };

  constructor(renderer: THREE.WebGLRenderer) {
    this._renderer = renderer;
    this._originalState = {};
  }

  setScissor(x: number, y: number, width: number, height: number): void {
    const scissorData = this._renderer.getScissor(new Vector4());
    this._originalState = { scissorData: scissorData ? scissorData : undefined, ...this._originalState };
    this._renderer.setScissor(x, y, width, height);
  }

  setScissorTest(enabled: boolean): void {
    this._originalState = { scissorTest: this._renderer.getScissorTest(), ...this._originalState };
    this._renderer.setScissorTest(enabled);
  }

  setClearColor(color: THREE.Color | number | string, alpha?: number): void {
    this._originalState = {
      clearColor: this._renderer.getClearColor(new THREE.Color()),
      clearAlpha: this._renderer.getClearAlpha(),
      ...this._originalState
    };
    this._renderer.setClearColor(color, alpha);
  }

  setWebGLState(state: WebGLState, resetState: WebGLState = WebGLRendererStateHelper.DefaultWebGLState): void {
    this._originalState = {
      webGLState: {
        buffers: state?.buffers ? {} : undefined
      },
      ...this._originalState
    };

    if (state?.buffers?.depth) {
      const newTest = state.buffers.depth?.test;
      const newMask = state.buffers.depth?.mask;

      this._originalState.webGLState!.buffers!.depth = {
        test: newTest ? resetState.buffers?.depth?.test : undefined,
        mask: newMask ? resetState.buffers?.depth?.mask : undefined
      };

      if (newMask) this._renderer.state.buffers.depth.setMask(newMask);
      if (newTest) this._renderer.state.buffers.depth.setTest(newTest);
    }
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
    if (this._originalState.scissorData !== undefined) {
      this._renderer.setScissor(this._originalState.scissorData);
    }
    if (this._originalState.scissorTest !== undefined) {
      this._renderer.setScissorTest(this._originalState.scissorTest);
    }
    if (this._originalState.webGLState !== undefined) {
      if (this._originalState.webGLState?.buffers?.depth) {
        const lastTest = this._originalState.webGLState.buffers.depth?.test;
        const lastMask = this._originalState.webGLState.buffers.depth?.mask;

        if (lastMask) this._renderer.state.buffers.depth.setMask(lastMask);
        if (lastTest) this._renderer.state.buffers.depth.setTest(lastTest);
      }
    }

    this._originalState = {};
  }
}
