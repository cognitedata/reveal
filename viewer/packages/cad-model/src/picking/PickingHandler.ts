/*!
 * Copyright 2022 Cognite AS
 */

import type { Box3, PerspectiveCamera, Ray, WebGLRenderer } from 'three';
import { Color, Raycaster, Scene, Vector3, WebGLRenderTarget } from 'three';
import type { IntersectInput } from '@reveal/model-base';
import type { CadMaterialManager, RenderPipelineProvider } from '@reveal/rendering';
import { BasicPipelineExecutor, CadGeometryRenderModePipelineProvider, RenderMode } from '@reveal/rendering';
import type { SceneHandler } from '@reveal/utilities';
import { WebGLRendererStateHelper } from '@reveal/utilities';
import type { CadNode } from '../wrappers/CadNode';
import { Mutex } from 'async-mutex';
import { CadPickBuffer } from './CadPickBuffer';
import { CadPickCache } from './CadPickCache';
import { depthToIntersection } from './depthToIntersection';
import type { IntersectCadNodesResult } from './types';

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

export class PickingHandler {
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

  private readonly _pickCache: CadPickCache;

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

    this._treeIndexRenderPipeline.setOutputRenderTarget(this._pickPixelColorStorage.renderTarget, false);
    this._depthRenderPipeline.setOutputRenderTarget(this._pickPixelColorStorage.renderTarget, false);

    this._pickCache = new CadPickCache(renderer, materialManager, sceneHandler);
  }

  /**
   * Invalidates the cached full-frame pick buffer. Must be called whenever a new frame of the
   * scene is rendered (camera, sector loading, styling or clipping changes).
   */
  public invalidatePickCache(): void {
    this._pickCache.invalidate();
  }

  public dispose(): void {
    this._pickCache.dispose();
    this._pickPixelColorStorage.renderTarget.dispose();
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
      const cachedResults = await this._pickCache.intersect(visibleCadNodes, input, shouldRunAsync);
      if (cachedResults !== undefined) {
        return cachedResults;
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
    return depthToIntersection(depth, input.camera, input.normalizedCoords);
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
