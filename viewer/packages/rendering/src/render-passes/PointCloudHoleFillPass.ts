/*!
 * Copyright 2026 Cognite AS
 */

import type { Mesh, WebGLRenderer } from 'three';
import {
  AlwaysDepth,
  Color,
  DepthTexture,
  GLSL3,
  NearestFilter,
  RawShaderMaterial,
  RGBAFormat,
  FloatType,
  UnsignedIntType,
  Vector2,
  WebGLRenderTarget
} from 'three';
import { WebGLRendererStateHelper } from '@reveal/utilities';
import { pointCloudShaders } from '../rendering/shaders';
import { createFullScreenTriangleMesh, unitOrthographicCamera } from '../utilities/renderUtilities';
import type { RenderPass } from '../RenderPass';

/**
 * Depth-aware screen-space hole filling for point clouds.
 *
 * Reads the rendered point cloud colour + depth, fills empty pixels from their nearest covered
 * neighbour and writes the result back into the same target so the rest of the pipeline is
 * unaffected. Runs `iterations` full-screen passes, each closing gaps up to one pixel wider,
 * ping-ponging through two scratch targets. Does nothing when `iterations <= 0`.
 */
export class PointCloudHoleFillPass implements RenderPass {
  private readonly _target: WebGLRenderTarget;
  private readonly _scratch: [WebGLRenderTarget, WebGLRenderTarget];
  private readonly _material: RawShaderMaterial;
  private readonly _fullScreenTriangle: Mesh;
  private readonly _size = new Vector2(1, 1);
  private static readonly _clearColor = new Color(0, 0, 0);

  private _iterations: number;

  constructor(target: WebGLRenderTarget, iterations: number) {
    this._target = target;
    this._iterations = Math.max(0, Math.floor(iterations));

    this._scratch = [createHoleFillTarget(), createHoleFillTarget()];

    this._material = new RawShaderMaterial({
      vertexShader: pointCloudShaders.holeFill.vertex,
      fragmentShader: pointCloudShaders.holeFill.fragment,
      glslVersion: GLSL3,
      uniforms: {
        tDiffuse: { value: null },
        tDepth: { value: null },
        texelSize: { value: new Vector2(1, 1) }
      },
      depthTest: true,
      depthWrite: true,
      depthFunc: AlwaysDepth
    });

    this._fullScreenTriangle = createFullScreenTriangleMesh(this._material);
  }

  get iterations(): number {
    return this._iterations;
  }

  set iterations(value: number) {
    this._iterations = Math.max(0, Math.floor(value));
  }

  public setSize(width: number, height: number): void {
    // Scratch targets are only allocated at full resolution while the effect is enabled - when
    // disabled they stay 1x1 and cost nothing.
    if (this._iterations <= 0 || (width === this._size.x && height === this._size.y)) {
      return;
    }
    this._size.set(width, height);
    this._scratch[0].setSize(width, height);
    this._scratch[1].setSize(width, height);
    (this._material.uniforms.texelSize.value as Vector2).set(1 / width, 1 / height);
  }

  public render(renderer: WebGLRenderer): void {
    if (this._iterations <= 0) {
      return;
    }

    this.setSize(this._target.width, this._target.height);

    const stateHelper = new WebGLRendererStateHelper(renderer);
    stateHelper.autoClear = true;
    stateHelper.setClearColor(PointCloudHoleFillPass._clearColor, 0.0);

    try {
      let source = this._target;
      for (let i = 0; i < this._iterations; i++) {
        const isLast = i === this._iterations - 1;
        let destination = isLast ? this._target : this._scratch[i % 2];
        if (destination === source) {
          // Only happens with a single iteration - bounce through a scratch target instead.
          destination = this._scratch[i % 2];
        }
        this.blit(renderer, source, destination);
        source = destination;
      }

      if (source !== this._target) {
        this.blit(renderer, source, this._target);
      }
    } finally {
      stateHelper.resetState();
    }
  }

  private blit(renderer: WebGLRenderer, source: WebGLRenderTarget, destination: WebGLRenderTarget): void {
    this._material.uniforms.tDiffuse.value = source.texture;
    this._material.uniforms.tDepth.value = source.depthTexture;
    renderer.setRenderTarget(destination);
    renderer.render(this._fullScreenTriangle, unitOrthographicCamera);
  }

  public dispose(): void {
    this._scratch[0].dispose();
    this._scratch[1].dispose();
    this._material.dispose();
    this._fullScreenTriangle.geometry.dispose();
  }
}

function createHoleFillTarget(): WebGLRenderTarget {
  return new WebGLRenderTarget(1, 1, {
    minFilter: NearestFilter,
    magFilter: NearestFilter,
    format: RGBAFormat,
    type: FloatType,
    depthTexture: new DepthTexture(1, 1, UnsignedIntType)
  });
}
