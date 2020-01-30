/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { Pass, createSsaoPass } from './post-processing/ssao';

export class Renderer {
  private _ssaoPass: Pass;
  private _glRenderer: THREE.WebGLRenderer;

  constructor(renderer: THREE.WebGLRenderer) {
    this._ssaoPass = createSsaoPass();
    this._glRenderer = renderer;
  }

  setSize(width: number, height: number, updateStyle?: boolean) {
    this._glRenderer.setSize(width, height, updateStyle);
    this._ssaoPass.setSize(width, height);
  }

  render(scene: THREE.Scene, camera: THREE.Camera) {
    if (camera.type !== 'PerspectiveCamera') {
      throw new Error('SsaoRenderer: Camera must be a THREE.PerspectiveCamera');
    }
    const perspectiveCamera = camera as THREE.PerspectiveCamera;
    this._ssaoPass.render(this._glRenderer, scene, perspectiveCamera);
  }
}
