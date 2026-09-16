/*!
 * Copyright 2022 Cognite AS
 */

import type { Box3, Object3D, PerspectiveCamera, Ray, WebGLRenderer } from 'three';
import { Color, Raycaster, Vector3, Vector4, WebGLRenderTarget } from 'three';
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

type IntersectCadNodesResult = {
  distance: number;
  point: Vector3;
  treeIndex: number;
  cadNode: CadNode;
  object: Object3D; // always CadNode
};

type CadNodeCandidate = {
  cadNode: CadNode;
  intersectPosition: Vector3;
};

export class PickingHandler {
  private readonly _clearColor: Color;
  private readonly _clearAlpha: number;
  private readonly _raycaster: Raycaster;

  private readonly _pickPixelColorStorage: {
    renderTarget: WebGLRenderTarget;
    pixelBuffer: Uint8Array;
  };

  private readonly _rgbaVector = new Vector4();

  /**
   * These factors are used for undoing the `packDepthToRGBA` GLSL operation defined by ThreeJS.
   * They are taken from https://github.com/WestLangley/three.js/blob/bc58fecba18150103b95fbde5aaa3cc7cddf95a7/src/renderers/shaders/ShaderChunk/packing.glsl.js#L19
   */
  private readonly _unpackFactors = new Vector4(
    255 / 256,
    255 / 256 / 256,
    255 / 256 / (256 * 256),
    1 / (256 * 256 * 256)
  );
  private readonly _pipelineExecutor: BasicPipelineExecutor;
  private readonly _depthRenderPipeline: CadGeometryRenderModePipelineProvider;
  private readonly _treeIndexRenderPipeline: CadGeometryRenderModePipelineProvider;
  private readonly _mutex = new Mutex();

  // Maximum number of CAD models that can be picked in a single combined GPU pass. The model
  // a hit belongs to is encoded as `modelIndex + 1` in the pick buffer's alpha byte (0 = no hit),
  // so at most 254 models are addressable (255 stays reserved/unused). Beyond that, picking falls
  // back to the slower sequential per-model path rather than wrapping/aliasing onto another model.
  private static readonly MAX_COMBINED_PICK_MODELS = 254;

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
  }

  public async intersectCadNodes(
    cadNodes: CadNode[],
    input: IntersectInput,
    shouldRunAsync = true
  ): Promise<IntersectCadNodesResult[]> {
    // Exit when no cadNode exists
    if (cadNodes.length < 1) {
      return [];
    }
    const release = await this._mutex.acquire();

    // Get CadNodes which are visible.
    const visibleCadNodes = cadNodes.filter(node => node.visible);
    // Filter nodes which cannot hit pick point.
    const filteredCadNodes = this.filterOutOfBoundCadNodes(visibleCadNodes, input);

    try {
      if (filteredCadNodes.length === 0) {
        return [];
      }

      // Render all candidate models in a single combined pass, disambiguated via a per-model
      // uniform - one tree-index readback and one depth readback regardless of model count,
      // instead of up to two round trips per model. Falls back to the old sequential per-model
      // path only when there are more candidates than the combined encoding can address.
      if (filteredCadNodes.length <= PickingHandler.MAX_COMBINED_PICK_MODELS) {
        return await this.intersectCadNodesCombined(filteredCadNodes, visibleCadNodes, input, shouldRunAsync);
      }
      return await this.intersectCadNodesSequential(filteredCadNodes, visibleCadNodes, input, shouldRunAsync);
    } finally {
      // Restore CadNodes back to original visibility state
      visibleCadNodes.forEach(p => (p.visible = true));
      release();
    }
  }

  private async intersectCadNodesCombined(
    filteredCadNodes: CadNodeCandidate[],
    visibleCadNodes: CadNode[],
    input: IntersectInput,
    shouldRunAsync: boolean
  ): Promise<IntersectCadNodesResult[]> {
    visibleCadNodes.forEach(p => (p.visible = false));
    filteredCadNodes.forEach((cadNodeData, index) => {
      cadNodeData.cadNode.visible = true;
      forEachMaterial(cadNodeData.cadNode.cadMaterial.materials, material => {
        material.uniforms.modelIndex.value = index;
      });
    });

    const pixelBuffer = await this.pickPixel(
      input,
      this._treeIndexRenderPipeline,
      this._clearColor,
      this._clearAlpha,
      shouldRunAsync
    );

    if (pixelBuffer[3] === 0) {
      return [];
    }

    const modelIndex = pixelBuffer[3] - 1;
    const cadNodeData = filteredCadNodes[modelIndex];
    if (cadNodeData === undefined) {
      // Defensive: unreachable given MAX_COMBINED_PICK_MODELS, but never index out of bounds.
      return [];
    }

    const treeIndex = pixelBuffer[0] * 255 * 255 + pixelBuffer[1] * 255 + pixelBuffer[2];

    const depthResult = await this.intersectCadNodeDepth(input, shouldRunAsync);

    return [
      {
        distance: depthResult.distance,
        point: depthResult.point,
        treeIndex,
        object: cadNodeData.cadNode,
        cadNode: cadNodeData.cadNode
      }
    ];
  }

  private async intersectCadNodesSequential(
    filteredCadNodes: CadNodeCandidate[],
    visibleCadNodes: CadNode[],
    input: IntersectInput,
    shouldRunAsync: boolean
  ): Promise<IntersectCadNodesResult[]> {
    const results: IntersectCadNodesResult[] = [];

    for (const cadNodeData of filteredCadNodes) {
      // Skip cad node when its bounds is further away than any already hit position.
      const minIntersectCadNodeDistance = cadNodeData.intersectPosition.distanceTo(input.camera.position);
      if (results.some(cadNodeResult => cadNodeResult.distance < minIntersectCadNodeDistance)) {
        continue;
      }

      // Make current CadNode visible & hide others
      visibleCadNodes.forEach(p => (p.visible = false));
      cadNodeData.cadNode.visible = true;
      const treeIndex = await this.pickTreeIndex(input, shouldRunAsync);
      if (treeIndex !== undefined) {
        // Assuming we have depth anywhere we hit a treeIndex
        const depthResult = await this.intersectCadNodeDepth(input, shouldRunAsync);
        results.push({
          distance: depthResult.distance,
          point: depthResult.point,
          treeIndex,
          object: cadNodeData.cadNode,
          cadNode: cadNodeData.cadNode
        });
      }
    }
    return results.sort((l, r) => l.distance - r.distance);
  }

  private filterOutOfBoundCadNodes(cadNodes: CadNode[], input: IntersectInput): CadNodeCandidate[] {
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

    function data(cadNodeData: [CadNode, Vector3]): CadNodeCandidate {
      return { cadNode: cadNodeData[0], intersectPosition: cadNodeData[1] };
    }
  }

  private async intersectCadNodeDepth(input: IntersectInput, shouldRunAsync: boolean) {
    const { camera } = input;
    const depth = await this.pickDepth(input, shouldRunAsync);

    const viewZ = this.perspectiveDepthToViewZ(depth, camera.near, camera.far);
    const point = this.getPosition(input, viewZ);
    const distance = new Vector3().subVectors(point, camera.position).length();
    return {
      distance,
      point
    };
  }

  private async pickTreeIndex(input: IntersectInput, shouldRunAsync: boolean): Promise<number | undefined> {
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

  private async pickDepth(input: IntersectInput, shouldRunAsync: boolean): Promise<number> {
    const pixelBuffer = await this.pickPixel(
      input,
      this._depthRenderPipeline,
      this._clearColor,
      this._clearAlpha,
      shouldRunAsync
    );

    return this.unpackRGBAToDepth(pixelBuffer);
  }

  private getPosition(input: IntersectInput, viewZ: number): Vector3 {
    const { camera, normalizedCoords } = input;
    const position = new Vector3();
    position.set(normalizedCoords.x, normalizedCoords.y, 0.5).applyMatrix4(camera.projectionMatrixInverse);

    position.multiplyScalar(viewZ / position.z);
    position.applyMatrix4(camera.matrixWorld);
    return position;
  }

  private async pickPixel(
    input: IntersectInput,
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

  private unpackRGBAToDepth(rgbaBuffer: Uint8Array) {
    return this._rgbaVector
      .fromArray(rgbaBuffer)
      .multiplyScalar(1 / 255)
      .dot(this._unpackFactors);
  }
}
