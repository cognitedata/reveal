/*!
 * Copyright 2026 Cognite AS
 */

import type { Matrix4, PerspectiveCamera, WebGLRenderer } from 'three';
import { Color, WebGLRenderTarget } from 'three';
import type { IntersectInput } from '@reveal/model-base';
import type { CadMaterialManager, RenderPipelineProvider } from '@reveal/rendering';
import {
  BasicPipelineExecutor,
  CadGeometryRenderModePipelineProvider,
  forEachMaterial,
  RenderMode
} from '@reveal/rendering';
import type { SceneHandler } from '@reveal/utilities';
import { WebGLRendererStateHelper } from '@reveal/utilities';
import { assert } from '@reveal/utilities/assert';
import type { CadNode } from '../wrappers/CadNode';
import { CadPickBuffer } from './CadPickBuffer';
import { depthToIntersection } from './depthToIntersection';
import type { IntersectCadNodesResult } from './types';

type PickCacheEntry = {
  buffer: CadPickBuffer;
  cadNodes: CadNode[];
  cameraMatrixWorld: Matrix4;
  cameraProjectionMatrix: Matrix4;
  valid: boolean;
};

/**
 * Full-frame pick cache. Renders the tree index and depth of all visible models in one pass each
 * and serves picks from the CPU copy until the scene is rendered again.
 */
export class CadPickCache {
  // If the cache was invalidated more recently than this, the scene is most likely rendering
  // continuously (camera movement). Rebuilding the full-frame cache then costs more
  // than a single-pixel pick, so the per-model single-pixel path is used instead.
  private static readonly REBUILD_HOLDOFF_MS = 64;

  // The model a hit belongs to is encoded as `modelIndex + 1` in the tree index pass's alpha byte
  // (0 = no hit), so at most 255 models can be picked in one combined pass.
  private static readonly MAX_CACHED_MODELS = 255;

  private readonly _clearColor = new Color('black');
  private readonly _clearAlpha = 0;
  private readonly _renderTarget = new WebGLRenderTarget(1, 1);
  private readonly _pipelineExecutor: BasicPipelineExecutor;
  private readonly _depthRenderPipeline: CadGeometryRenderModePipelineProvider;
  private readonly _treeIndexRenderPipeline: CadGeometryRenderModePipelineProvider;

  private _cache: PickCacheEntry | undefined;
  private _invalidationCount = 0;
  private _lastInvalidatedAt = 0;
  private _isDisposed = false;

  constructor(renderer: WebGLRenderer, materialManager: CadMaterialManager, sceneHandler: SceneHandler) {
    this._pipelineExecutor = new BasicPipelineExecutor(renderer);
    this._depthRenderPipeline = new CadGeometryRenderModePipelineProvider(
      RenderMode.Depth,
      materialManager,
      sceneHandler
    );
    this._treeIndexRenderPipeline = new CadGeometryRenderModePipelineProvider(
      RenderMode.TreeIndex,
      materialManager,
      sceneHandler
    );
    this._depthRenderPipeline.setOutputRenderTarget(this._renderTarget, false);
    this._treeIndexRenderPipeline.setOutputRenderTarget(this._renderTarget, false);
  }

  /**
   * Marks the cache stale. Must be called whenever scene content that affects picking changes. Camera changes are detected by comparing camera matrices.
   */
  public invalidate(): void {
    if (this._cache !== undefined) {
      this._cache.valid = false;
      this._cache.cadNodes = [];
    }
    this._invalidationCount++;
    this._lastInvalidatedAt = Date.now();
  }

  public dispose(): void {
    this._isDisposed = true;
    this._cache = undefined;
    this._renderTarget.dispose();
  }

  /**
   * Picks from the cache, rebuilding it first when it is stale and the frame is likely to stay
   * unchanged. Returns undefined when the per-model path should be used instead.
   */
  public async intersect(
    visibleCadNodes: CadNode[],
    input: IntersectInput,
    shouldRunAsync: boolean
  ): Promise<IntersectCadNodesResult | undefined> {
    if (
      input.forceWindowedPick === true ||
      visibleCadNodes.length === 0 ||
      visibleCadNodes.length > CadPickCache.MAX_CACHED_MODELS
    ) {
      return undefined;
    }

    const width = Math.max(1, Math.floor(input.domElement.clientWidth));
    const height = Math.max(1, Math.floor(input.domElement.clientHeight));

    if (!this.isUsable(visibleCadNodes, input.camera, width, height)) {
      // A known-in-motion camera is about to invalidate whatever we build anyway and a synchronous
      // full-frame readback would stall the caller.
      const sinceInvalidatedMs = Date.now() - this._lastInvalidatedAt;
      const shouldRebuild =
        shouldRunAsync && input.cameraInMotion !== true && sinceInvalidatedMs >= CadPickCache.REBUILD_HOLDOFF_MS;
      if (!shouldRebuild || !(await this.build(visibleCadNodes, input, width, height))) {
        return undefined;
      }
    }

    const cache = this._cache;
    assert(cache !== undefined, 'Pick cache must be populated after a successful build');
    const hit = cache.buffer.getHit(input.normalizedCoords);
    if (hit === undefined) {
      return undefined;
    }
    const cadNode = cache.cadNodes[hit.modelIndex];
    if (cadNode === undefined) {
      return undefined;
    }
    const { distance, point } = depthToIntersection(hit.depth, input.camera, input.normalizedCoords);
    return { distance, point, treeIndex: hit.treeIndex, object: cadNode, cadNode };
  }

  private isUsable(visibleCadNodes: CadNode[], camera: PerspectiveCamera, width: number, height: number): boolean {
    const cache = this._cache;
    return (
      cache !== undefined &&
      cache.valid &&
      cache.buffer.width === width &&
      cache.buffer.height === height &&
      cache.cameraMatrixWorld.equals(camera.matrixWorld) &&
      cache.cameraProjectionMatrix.equals(camera.projectionMatrix) &&
      cache.cadNodes.length === visibleCadNodes.length &&
      cache.cadNodes.every((node, i) => node === visibleCadNodes[i])
    );
  }

  /**
   * Renders the tree index and depth of all visible models into full-frame buffers, one pass each,
   * so every pixel holds the hit closest to the camera. Returns false if the result is stale.
   */
  private async build(
    visibleCadNodes: CadNode[],
    input: IntersectInput,
    width: number,
    height: number
  ): Promise<boolean> {
    const { camera, renderer } = input;
    const invalidationCountAtStart = this._invalidationCount;
    // The camera is not covered by the invalidation count, so it is snapshotted before the first
    // render and compared again once both passes have been read back.
    const cameraMatrixWorld = camera.matrixWorld.clone();
    const cameraProjectionMatrix = camera.projectionMatrix.clone();

    // Each model writes its index to the alpha byte of the tree index pass.
    visibleCadNodes.forEach((cadNode, index) => {
      forEachMaterial(cadNode.cadMaterial.materials, material => {
        if (material.uniforms.modelIndex === undefined) {
          throw new Error('CAD material has no modelIndex uniform, cannot build the pick cache');
        }
        material.uniforms.modelIndex.value = index;
      });
    });

    const previousBuffer = this._cache?.buffer;
    const buffer =
      previousBuffer !== undefined && previousBuffer.width === width && previousBuffer.height === height
        ? previousBuffer
        : new CadPickBuffer(width, height);
    this._cache = undefined;

    this._renderTarget.setSize(width, height);
    await this.renderAndReadFullFrame(this._treeIndexRenderPipeline, camera, renderer, buffer.treeIndexPixels);
    // dispose() may have run during the first readback, and the render target must not be reused then.
    if (this._isDisposed) {
      return false;
    }
    await this.renderAndReadFullFrame(this._depthRenderPipeline, camera, renderer, buffer.depthPixels);
    if (this._isDisposed) {
      return false;
    }

    this._cache = {
      buffer,
      cadNodes: [...visibleCadNodes],
      cameraMatrixWorld,
      cameraProjectionMatrix,
      // The scene content may have changed or the camera may have moved while the readbacks were in flight, so the
      // buffer then describes a previous frame (or mixes two cameras) and must not be served.
      valid:
        this._invalidationCount === invalidationCountAtStart &&
        cameraMatrixWorld.equals(camera.matrixWorld) &&
        cameraProjectionMatrix.equals(camera.projectionMatrix)
    };
    return this._cache.valid;
  }

  private async renderAndReadFullFrame(
    renderPipeline: RenderPipelineProvider,
    camera: PerspectiveCamera,
    renderer: WebGLRenderer,
    pixelBuffer: Uint8Array
  ): Promise<void> {
    const renderTarget = this._renderTarget;
    const stateHelper = new WebGLRendererStateHelper(renderer);
    let readPixelsPromise: Promise<unknown>;
    try {
      stateHelper.setClearColor(this._clearColor, this._clearAlpha);
      this._pipelineExecutor.render(renderPipeline, camera);
      readPixelsPromise = renderer.readRenderTargetPixelsAsync(
        renderTarget,
        0,
        0,
        renderTarget.width,
        renderTarget.height,
        pixelBuffer
      );
    } finally {
      stateHelper.resetState();
    }
    await readPixelsPromise;
  }
}
