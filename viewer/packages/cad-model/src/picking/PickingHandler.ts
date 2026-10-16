/*!
 * Copyright 2022 Cognite AS
 */

import type { Box3, Matrix4, Object3D, PerspectiveCamera, Ray, WebGLRenderer } from 'three';
import { Color, Raycaster, Scene, Vector3, WebGLRenderTarget } from 'three';
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
import type { CadNode } from '../wrappers/CadNode';
import { Mutex } from 'async-mutex';
import { CadPickBuffer } from './CadPickBuffer';

type PickingInput = {
  normalizedCoords: {
    x: number;
    y: number;
  };
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  domElement: HTMLElement;
  cadNodes: CadNode[];
};

type TreeIndexPickingInput = PickingInput & {
  cadNode: CadNode;
};

type IntersectCadNodesResult = {
  distance: number;
  point: Vector3;
  treeIndex: number;
  cadNode: CadNode;
  object: Object3D; // always CadNode
};

type PickCache = {
  buffer: CadPickBuffer;
  cadNodes: CadNode[];
  cameraMatrixWorld: Matrix4;
  cameraProjectionMatrix: Matrix4;
  valid: boolean;
};

export class PickingHandler {
  // If the cache was invalidated more recently than this, the scene is most likely rendering
  // continuously (camera movement). Rebuilding the full-frame cache then costs more
  // than a single-pixel pick, so the per-model single-pixel path is used instead.
  private static readonly REBUILD_HOLDOFF_MS = 64;

  // The model a hit belongs to is encoded as `modelIndex + 1` in the tree index pass's alpha byte
  // (0 = no hit), so at most 254 models can be picked in one combined pass.
  private static readonly MAX_CACHED_MODELS = 254;

  private readonly _clearColor: Color;
  private readonly _clearAlpha: number;
  private readonly _raycaster: Raycaster;

  private readonly _pickPixelColorStorage: {
    renderTarget: WebGLRenderTarget;
    pixelBuffer: Uint8Array;
  };

  private readonly _pipelineExecutor: BasicPipelineExecutor;
  private readonly _depthRenderPipeline: CadGeometryRenderModePipelineProvider;
  private readonly _treeIndexRenderPipeline: CadGeometryRenderModePipelineProvider;
  private readonly _mutex = new Mutex();

  private readonly _fullFrameRenderTarget = new WebGLRenderTarget(1, 1);
  private _cache: PickCache | undefined;
  private _invalidationCount = 0;
  private _lastInvalidatedAt = 0;
  private _isDisposed = false;

  constructor(renderer: WebGLRenderer, materialManager: CadMaterialManager, sceneHandler: SceneHandler) {
    this._clearColor = new Color('black');
    this._clearAlpha = 0;
    this._raycaster = new Raycaster();

    this._pickPixelColorStorage = {
      renderTarget: new WebGLRenderTarget(1, 1),
      pixelBuffer: new Uint8Array(4)
    };

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

    this.setPipelineOutputRenderTarget(this._pickPixelColorStorage.renderTarget);
  }

  /**
   * Invalidates the cached full-frame pick buffer. Must be called whenever a new frame of the
   * scene is rendered (camera, sector loading, styling or clipping changes).
   */
  public invalidatePickCache(): void {
    if (this._cache !== undefined) {
      this._cache.valid = false;
      this._cache.cadNodes = [];
    }
    this._invalidationCount++;
    this._lastInvalidatedAt = performance.now();
  }

  public dispose(): void {
    this._isDisposed = true;
    this._cache = undefined;
    this._pickPixelColorStorage.renderTarget.dispose();
    this._fullFrameRenderTarget.dispose();
  }

  public async intersectCadNodes(
    cadNodes: CadNode[],
    input: IntersectInput,
    shouldRunAsync = true
  ): Promise<IntersectCadNodesResult[]> {
    const results: IntersectCadNodesResult[] = [];

    // Exit when no cadNode exists
    if (cadNodes.length < 1) {
      return results;
    }
    const release = await this._mutex.acquire();
    const scene = new Scene();
    const depthInput = { ...input, scene, cadNodes };

    // Identify the treeIndex associated with the position.
    // Get CadNodes which are visible.
    const visibleCadNodes = cadNodes.filter(node => node.visible);
    try {
      if (visibleCadNodes.length <= PickingHandler.MAX_CACHED_MODELS) {
        const cachedResults = await this.tryIntersectFromCache(visibleCadNodes, input, shouldRunAsync);
        if (cachedResults !== undefined) {
          return cachedResults;
        }
      }

      const filteredCadNodes = this.filterOutOfBoundCadNodes(visibleCadNodes, input);

      for (const cadNodeData of filteredCadNodes) {
        // Skip cad node when its bounds is further away than any already hit position.
        const minIntersectCadNodeDistance = cadNodeData.intersectPosition.distanceTo(input.camera.position);
        if (results.some(cadNodeResult => cadNodeResult.distance < minIntersectCadNodeDistance)) {
          continue;
        }

        // Make current CadNode visible & hide others
        visibleCadNodes.forEach(p => (p.visible = false));
        cadNodeData.cadNode.visible = true;
        const treeIndex = await this.intersectCadNodeTreeIndex(cadNodeData.cadNode, input, shouldRunAsync);
        if (treeIndex) {
          // Assuming we have depth anywhere we hit a treeIndex
          const depthResult = await this.intersectCadNodeDepth(depthInput, shouldRunAsync);
          const result: IntersectCadNodesResult = {
            distance: depthResult.distance,
            point: depthResult.point,
            treeIndex,
            object: cadNodeData.cadNode,
            cadNode: cadNodeData.cadNode
          };
          if (result) {
            results.push(result);
          }
        }
      }
      return results.sort((l, r) => l.distance - r.distance);
    } finally {
      // Restore CadNodes back to original visibility state
      visibleCadNodes.forEach(p => (p.visible = true));
      release();
    }
  }

  /**
   * Picks from the full-frame pick cache, rebuilding it first when it is stale and the frame is
   * likely to stay unchanged. Returns undefined when the per-model path should be used instead.
   */
  private async tryIntersectFromCache(
    visibleCadNodes: CadNode[],
    input: IntersectInput,
    shouldRunAsync: boolean
  ): Promise<IntersectCadNodesResult[] | undefined> {
    if (input.forceWindowedPick === true || visibleCadNodes.length === 0) {
      return undefined;
    }

    const width = Math.max(1, Math.floor(input.domElement.clientWidth));
    const height = Math.max(1, Math.floor(input.domElement.clientHeight));

    if (!this.isCacheUsable(visibleCadNodes, input.camera, width, height)) {
      // A known-in-motion camera is about to invalidate whatever we build anyway and a synchronous
      // full-frame readback would stall the caller.
      const sinceInvalidatedMs = performance.now() - this._lastInvalidatedAt;
      const shouldRebuild =
        shouldRunAsync && input.cameraInMotion !== true && sinceInvalidatedMs >= PickingHandler.REBUILD_HOLDOFF_MS;
      if (!shouldRebuild || !(await this.buildCache(visibleCadNodes, input, width, height))) {
        return undefined;
      }
    }

    const cache = this._cache!;
    const hit = cache.buffer.getHit(input.normalizedCoords);
    const cadNode = hit !== undefined ? cache.cadNodes[hit.modelIndex] : undefined;
    if (hit === undefined || cadNode === undefined) {
      return [];
    }
    const { distance, point } = this.depthToIntersection(hit.depth, input);
    return [{ distance, point, treeIndex: hit.treeIndex, object: cadNode, cadNode }];
  }

  private isCacheUsable(visibleCadNodes: CadNode[], camera: PerspectiveCamera, width: number, height: number): boolean {
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
  private async buildCache(
    visibleCadNodes: CadNode[],
    input: IntersectInput,
    width: number,
    height: number
  ): Promise<boolean> {
    const { camera, renderer } = input;
    const invalidationCountAtStart = this._invalidationCount;

    const previousBuffer = this._cache?.buffer;
    const buffer =
      previousBuffer !== undefined && previousBuffer.width === width && previousBuffer.height === height
        ? previousBuffer
        : new CadPickBuffer(width, height);
    this._cache = undefined;

    // Each model writes its index to the alpha byte of the tree index pass.
    visibleCadNodes.forEach((cadNode, index) => {
      forEachMaterial(cadNode.cadMaterial.materials, material => {
        material.uniforms.modelIndex.value = index;
      });
    });

    const renderTarget = this._fullFrameRenderTarget;
    renderTarget.setSize(width, height);
    this.setPipelineOutputRenderTarget(renderTarget);
    try {
      await this.renderAndReadFullFrame(this._treeIndexRenderPipeline, camera, renderer, buffer.treeIndexPixels);
      await this.renderAndReadFullFrame(this._depthRenderPipeline, camera, renderer, buffer.depthPixels);
    } finally {
      this.setPipelineOutputRenderTarget(this._pickPixelColorStorage.renderTarget);
    }
    if (this._isDisposed) {
      return false;
    }

    this._cache = {
      buffer,
      cadNodes: [...visibleCadNodes],
      cameraMatrixWorld: camera.matrixWorld.clone(),
      cameraProjectionMatrix: camera.projectionMatrix.clone(),
      // The scene may have rendered a new frame while the readbacks were in flight, so the buffer then describes the previous frame and must not be served.
      valid: this._invalidationCount === invalidationCountAtStart
    };
    return this._cache.valid;
  }

  private async renderAndReadFullFrame(
    renderPipeline: RenderPipelineProvider,
    camera: PerspectiveCamera,
    renderer: WebGLRenderer,
    pixelBuffer: Uint8Array
  ): Promise<void> {
    const renderTarget = this._fullFrameRenderTarget;
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

  private setPipelineOutputRenderTarget(renderTarget: WebGLRenderTarget): void {
    this._treeIndexRenderPipeline.setOutputRenderTarget(renderTarget, false);
    this._depthRenderPipeline.setOutputRenderTarget(renderTarget, false);
  }

  private filterOutOfBoundCadNodes(cadNodes: CadNode[], input: IntersectInput) {
    // Ensure the ray overlaps any point on the given models bounding box.
    this._raycaster.setFromCamera(input.normalizedCoords, input.camera);
    const ray = this._raycaster.ray;
    const cameraPosition = input.camera.position.clone();

    // Remove all cadNodes that cannot be hit. Avoid a raycast against them
    const candidateCadNodes = cadNodes
      .map(cadNode => getIntersection(cadNode, ray))
      .filter(hasIntersection)
      .sort(byIntersectDistanceToCamera)
      .map(data);

    return candidateCadNodes;

    function getIntersection(cadNode: CadNode, ray: Ray): [CadNode, Vector3 | null] {
      const nodeBounds = getWorldSpaceNodeBounds(cadNode);
      // If we are inside the box, set the intersection point to the ray origin point
      return [cadNode, nodeBounds.containsPoint(ray.origin) ? ray.origin : ray.intersectBox(nodeBounds, new Vector3())];
    }

    function getWorldSpaceNodeBounds(node: CadNode): Box3 {
      const cadNodeBoundingBox = node.cadModelMetadata.scene.root.subtreeBoundingBox.clone();
      return cadNodeBoundingBox.applyMatrix4(node.cadModelMetadata.modelMatrix);
    }

    function hasIntersection(
      cadNodeIntersection: [CadNode, Vector3 | null]
    ): cadNodeIntersection is [CadNode, Vector3] {
      const intersectPosition = cadNodeIntersection[1];
      return intersectPosition !== null;
    }

    function byIntersectDistanceToCamera([_0, a]: [CadNode, Vector3], [_1, b]: [CadNode, Vector3]): number {
      return a.distanceToSquared(cameraPosition) - b.distanceToSquared(cameraPosition);
    }

    function data(cadNodeData: [CadNode, Vector3]): { cadNode: CadNode; intersectPosition: Vector3 } {
      return { cadNode: cadNodeData[0], intersectPosition: cadNodeData[1] };
    }
  }

  private async intersectCadNodeDepth(input: PickingInput, shouldRunAsync: boolean) {
    const depth = await this.pickDepth(input, shouldRunAsync);
    return this.depthToIntersection(depth, input);
  }

  private depthToIntersection(
    depth: number,
    input: Pick<PickingInput, 'camera' | 'normalizedCoords'>
  ): { distance: number; point: Vector3 } {
    const { camera } = input;
    const viewZ = this.perspectiveDepthToViewZ(depth, camera.near, camera.far);
    const point = this.getPosition(input, viewZ);
    const distance = new Vector3().subVectors(point, camera.position).length();
    return {
      distance,
      point
    };
  }

  private async intersectCadNodeTreeIndex(
    cadNode: CadNode,
    input: IntersectInput,
    shouldRunAsync: boolean
  ): Promise<number | undefined> {
    const { camera, normalizedCoords, renderer, domElement } = input;
    const pickingScene = new Scene();

    const pickInput = {
      normalizedCoords,
      camera,
      renderer,
      domElement,
      scene: pickingScene,
      cadNodes: [],
      cadNode
    };
    const treeIndex = await this.pickTreeIndex(pickInput, shouldRunAsync);
    if (treeIndex === undefined) {
      return undefined;
    }
    return treeIndex;
  }

  private async pickTreeIndex(input: TreeIndexPickingInput, shouldRunAsync: boolean): Promise<number | undefined> {
    const pixelBuffer = await this.pickPixel(
      input,
      this._treeIndexRenderPipeline,
      this._clearColor,
      this._clearAlpha,
      shouldRunAsync
    );

    if (pixelBuffer[3] === 0) {
      return;
    }

    const treeIndex = pixelBuffer[0] * 255 * 255 + pixelBuffer[1] * 255 + pixelBuffer[2];

    return treeIndex;
  }

  private perspectiveDepthToViewZ(invClipZ: number, near: number, far: number) {
    return (near * far) / ((far - near) * invClipZ - far);
  }

  private async pickDepth(input: PickingInput, shouldRunAsync: boolean): Promise<number> {
    const pixelBuffer = await this.pickPixel(
      input,
      this._depthRenderPipeline,
      this._clearColor,
      this._clearAlpha,
      shouldRunAsync
    );

    return CadPickBuffer.unpackDepth(pixelBuffer, 0);
  }

  private getPosition(input: Pick<PickingInput, 'camera' | 'normalizedCoords'>, viewZ: number): Vector3 {
    const { camera, normalizedCoords } = input;
    const position = new Vector3();
    position.set(normalizedCoords.x, normalizedCoords.y, 0.5).applyMatrix4(camera.projectionMatrixInverse);

    position.multiplyScalar(viewZ / position.z);
    position.applyMatrix4(camera.matrixWorld);
    return position;
  }

  private async pickPixel(
    input: PickingInput,
    renderPipeline: RenderPipelineProvider,
    clearColor: Color,
    clearAlpha: number,
    shouldRunAsync: boolean
  ) {
    const { renderTarget, pixelBuffer } = this._pickPixelColorStorage;
    const { camera, normalizedCoords, renderer, domElement } = input;

    // Prepare camera that only renders the single pixel we are interested in
    const pickCamera = camera.clone() as PerspectiveCamera;
    const absoluteCoords = {
      x: ((normalizedCoords.x + 1.0) / 2.0) * domElement.clientWidth,
      y: ((1.0 - normalizedCoords.y) / 2.0) * domElement.clientHeight
    };
    pickCamera.setViewOffset(domElement.clientWidth, domElement.clientHeight, absoluteCoords.x, absoluteCoords.y, 1, 1);

    const stateHelper = new WebGLRendererStateHelper(renderer);
    let readPixelsPromise: Promise<void>;
    try {
      stateHelper.setClearColor(clearColor, clearAlpha);
      this._pipelineExecutor.render(renderPipeline, pickCamera);
      readPixelsPromise = shouldRunAsync
        ? renderer.readRenderTargetPixelsAsync(renderTarget, 0, 0, 1, 1, pixelBuffer).then(() => {})
        : Promise.resolve(renderer.readRenderTargetPixels(renderTarget, 0, 0, 1, 1, pixelBuffer));
    } finally {
      // Note! State is reset before promise is resolved as there might be rendering happening between
      // "now" and when the result from readRenderTargetPixelsAsync is ready
      stateHelper.resetState();
    }
    await readPixelsPromise;
    return pixelBuffer;
  }
}
