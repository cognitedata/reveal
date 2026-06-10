import type { Camera, Ray, WebGLRenderer } from 'three';
import { Matrix4, Vector2, Vector3, MathUtils } from 'three';
import { DEFAULT_PICK_WINDOW_SIZE } from '@reveal/rendering';
import type { PointCloudOctree } from './PointCloudOctree';
import type { PickPoint } from '../types/types';
import type { IPickState, PickParams } from './PointCloudOctreePickerHelper';
import { PointCloudOctreePickerHelper } from './PointCloudOctreePickerHelper';
import type { RenderedNode } from './PointCloudOctreePickerHelper';

export type { PickParams };

type PickCache = {
  pixels: Uint8Array;
  ibuffer: Uint32Array;
  width: number;
  height: number;
  nodeIndexBits: number;
  renderedNodes: RenderedNode[];
  octrees: PointCloudOctree[];
  cameraMatrixWorld: Matrix4;
  cameraProjectionMatrix: Matrix4;
  valid: boolean;
};

export class PointCloudOctreePicker {
  private static readonly helperVec3 = new Vector3();
  private static readonly helperVec2 = new Vector2();

  // If the cache was invalidated more recently than this, the scene is most likely rendering
  // continuously (camera movement, animation). Rebuilding the full-frame cache then costs more
  // than a ray-culled windowed pick, so fall back to the windowed path instead.
  private static readonly REBUILD_HOLDOFF_MS = 64;

  private pickState: IPickState | undefined;
  private readonly _renderer: WebGLRenderer;
  private readonly _pickerHelper: PointCloudOctreePickerHelper;

  private _cache: PickCache | undefined;
  private _invalidationCount = 0;
  private _lastInvalidatedAt = 0;

  constructor(renderer: WebGLRenderer) {
    this._renderer = renderer;
    this._pickerHelper = new PointCloudOctreePickerHelper(renderer);
  }

  dispose(): void {
    if (this.pickState) {
      this.pickState.material.dispose();
      this.pickState.renderTarget.dispose();
    }

    this.pickState = undefined;
    this._cache = undefined;
  }

  /**
   * Invalidates the cached full-frame pick buffer. Must be called whenever a new frame of the
   * scene is rendered (camera, point cloud LOD, styling or clipping changes) and on resize.
   */
  invalidateCache(): void {
    if (this._cache !== undefined) {
      this._cache.valid = false;
      // Drop node references so geometries unloaded by LOD updates can be garbage collected.
      this._cache.renderedNodes = [];
    }
    this._invalidationCount++;
    this._lastInvalidatedAt = performance.now();
  }

  async pick(
    camera: Camera,
    ray: Ray,
    octrees: PointCloudOctree[],
    params: Partial<PickParams> = {}
  ): Promise<PickPoint | null> {
    if (octrees.length === 0) {
      return null;
    }
    const pickState = this.pickState ? this.pickState : (this.pickState = PointCloudOctreePickerHelper.getPickState());

    const pickWndSize = params.pickWindowSize ?? DEFAULT_PICK_WINDOW_SIZE;

    // Custom pick parameters change what gets rendered or where, so they cannot be answered
    // from (or stored into) the shared full-frame cache.
    const cacheEligible = params.onBeforePickRender === undefined && params.pixelPosition === undefined;
    if (cacheEligible) {
      const cssSize = this._renderer.getSize(PointCloudOctreePicker.helperVec2);
      const width = Math.max(1, Math.floor(cssSize.x));
      const height = Math.max(1, Math.floor(cssSize.y));
      const ndc = PointCloudOctreePicker.helperVec3.addVectors(camera.position, ray.direction).project(camera);
      const centerX = (ndc.x + 1) * width * 0.5;
      const centerY = (ndc.y + 1) * height * 0.5;

      if (this.isCacheUsable(camera, octrees, width, height)) {
        return this.pickFromCache(camera, centerX, centerY, pickWndSize);
      }

      if (performance.now() - this._lastInvalidatedAt >= PointCloudOctreePicker.REBUILD_HOLDOFF_MS) {
        const built = await this.buildCache(camera, octrees, params, width, height);
        if (built) {
          return this.pickFromCache(camera, centerX, centerY, pickWndSize);
        }
      }
    }

    return this.pickWindowed(camera, ray, octrees, params, pickState, pickWndSize);
  }

  private async pickWindowed(
    camera: Camera,
    ray: Ray,
    octrees: PointCloudOctree[],
    params: Partial<PickParams>,
    pickState: IPickState,
    pickWndSize: number
  ): Promise<PickPoint | null> {
    const pickMaterial = pickState.material;

    const renderSize = this._renderer.getDrawingBufferSize(new Vector2());
    PointCloudOctreePickerHelper.updatePickRenderTarget(pickState, renderSize.x, renderSize.y);

    const pixelPosition = PointCloudOctreePicker.helperVec3; // Use helper vector to prevent extra allocations.

    if (params.pixelPosition) {
      pixelPosition.copy(params.pixelPosition);
    } else {
      pixelPosition.addVectors(camera.position, ray.direction).project(camera);
      pixelPosition.x = (pixelPosition.x + 1) * renderSize.x * 0.5;
      pixelPosition.y = (pixelPosition.y + 1) * renderSize.y * 0.5;
    }

    const halfPickWndSize = (pickWndSize - 1) / 2;
    // Clamp start so the window [x, x+pickWndSize) stays within the render target.
    const x = Math.floor(
      MathUtils.clamp(pixelPosition.x - halfPickWndSize, 0, Math.max(0, renderSize.x - pickWndSize))
    );
    const y = Math.floor(
      MathUtils.clamp(pixelPosition.y - halfPickWndSize, 0, Math.max(0, renderSize.y - pickWndSize))
    );

    this._pickerHelper.prepareRender(x, y, pickWndSize, pickWndSize, pickMaterial, pickState);
    const renderedNodes = this._pickerHelper.render(camera, pickMaterial, octrees, ray, pickState, params);

    // Start async GPU readback before resetting GL state.
    const readPixelsPromise = this._pickerHelper.readPixelsAsync(x, y, pickWndSize, pickWndSize, pickState.renderTarget);

    // Reset GL state immediately (before awaiting) so other rendering can proceed in parallel.
    this._pickerHelper.resetState();

    const pixels = await readPixelsPromise;

    const hit = PointCloudOctreePickerHelper.findHit(pixels, pickWndSize, renderedNodes, camera);
    const pickPoint = PointCloudOctreePickerHelper.getPickPoint(hit, renderedNodes);

    return pickPoint;
  }

  private isCacheUsable(camera: Camera, octrees: PointCloudOctree[], width: number, height: number): boolean {
    const cache = this._cache;
    if (cache === undefined || !cache.valid) {
      return false;
    }
    if (cache.width !== width || cache.height !== height) {
      return false;
    }
    if (
      !cache.cameraMatrixWorld.equals(camera.matrixWorld) ||
      !cache.cameraProjectionMatrix.equals(camera.projectionMatrix)
    ) {
      return false;
    }
    if (cache.octrees.length !== octrees.length || !cache.octrees.every((octree, i) => octree === octrees[i])) {
      return false;
    }
    // Nodes may have been unloaded by LOD updates since the cache was built (which nulls the
    // scene node geometry) - hits could then not be resolved to positions.
    if (cache.renderedNodes.some(({ node }) => node.sceneNode.geometry === undefined)) {
      cache.valid = false;
      return false;
    }
    return true;
  }

  private async buildCache(
    camera: Camera,
    octrees: PointCloudOctree[],
    params: Partial<PickParams>,
    width: number,
    height: number
  ): Promise<boolean> {
    const pickState = this.pickState!;

    let nodeCount = 0;
    let maxPointsPerNode = 0;
    for (const octree of octrees) {
      nodeCount += octree.visibleNodes.length;
      for (const node of octree.visibleNodes) {
        maxPointsPerNode = Math.max(maxPointsPerNode, node.numPoints);
      }
    }
    if (nodeCount === 0) {
      return false;
    }

    const nodeIndexBits = PointCloudOctreePickerHelper.computeBitSplit(nodeCount, maxPointsPerNode);
    if (nodeIndexBits === undefined) {
      // The visible node set cannot be represented in the packed 32-bit pick value;
      // the ray-culled windowed path always can.
      return false;
    }

    const invalidationCountAtStart = this._invalidationCount;

    PointCloudOctreePickerHelper.updatePickRenderTarget(pickState, width, height);
    this._pickerHelper.prepareRender(0, 0, width, height, pickState.material, pickState);
    const renderedNodes = this._pickerHelper.render(
      camera,
      pickState.material,
      octrees,
      undefined,
      pickState,
      params,
      nodeIndexBits
    );

    const byteLength = 4 * width * height;
    const reusablePixels =
      this._cache !== undefined && this._cache.pixels.byteLength === byteLength ? this._cache.pixels : undefined;

    // Start async GPU readback before resetting GL state.
    const readPixelsPromise = this._pickerHelper.readPixelsAsync(
      0,
      0,
      width,
      height,
      pickState.renderTarget,
      reusablePixels
    );

    // Reset GL state immediately (before awaiting) so other rendering can proceed in parallel.
    this._pickerHelper.resetState();

    const pixels = await readPixelsPromise;

    this._cache = {
      pixels,
      ibuffer: new Uint32Array(pixels.buffer, 0, width * height),
      width,
      height,
      nodeIndexBits,
      renderedNodes,
      octrees: [...octrees],
      cameraMatrixWorld: camera.matrixWorld.clone(),
      cameraProjectionMatrix: camera.projectionMatrix.clone(),
      // The scene may have rendered a new frame while the readback was in flight - the buffer
      // then describes the previous frame and must not be served.
      valid: this._invalidationCount === invalidationCountAtStart
    };
    return this._cache.valid;
  }

  private pickFromCache(camera: Camera, centerX: number, centerY: number, pickWndSize: number): PickPoint | null {
    const cache = this._cache!;
    const hit = PointCloudOctreePickerHelper.findHitInBuffer(
      cache.ibuffer,
      cache.width,
      cache.height,
      centerX,
      centerY,
      pickWndSize,
      cache.renderedNodes,
      camera,
      cache.nodeIndexBits
    );
    return PointCloudOctreePickerHelper.getPickPoint(hit, cache.renderedNodes);
  }
}
