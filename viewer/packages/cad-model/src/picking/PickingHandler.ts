/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { IntersectInput } from '@reveal/model-base';
import {
  BasicPipelineExecutor,
  CadMaterialManager,
  CadGeometryRenderModePipelineProvider,
  RenderMode,
  RenderPipelineProvider
} from '@reveal/rendering';
import { SceneHandler, WebGLRendererStateHelper } from '@reveal/utilities';
import { CadNode } from '../wrappers/CadNode';
import { readPixelsFromTargetAsync } from './readPixelsFromTargetAsync';
import { Mutex } from 'async-mutex';

type PickingInput = {
  normalizedCoords: {
    x: number;
    y: number;
  };
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  domElement: HTMLElement;
  cadNodes: CadNode[];
};

type TreeIndexPickingInput = PickingInput & {
  cadNode: CadNode;
};

type IntersectCadNodesResult = {
  distance: number;
  point: THREE.Vector3;
  treeIndex: number;
  cadNode: CadNode;
  object: THREE.Object3D; // always CadNode
};

export class PickingHandler {
  private readonly _clearColor: THREE.Color;
  private readonly _clearAlpha: number;
  private readonly _raycaster: THREE.Raycaster;

  private readonly _pickPixelColorStorage: {
    renderTarget: THREE.WebGLRenderTarget;
    pixelBuffer: Uint8Array;
  };

  private readonly _rgbaVector = new THREE.Vector4();
  private readonly _unpackFactors = new THREE.Vector4(
    255 / 256 / (256 * 256 * 256),
    255 / 256 / (256 * 256),
    255 / 256 / 256,
    255 / 256
  );
  private readonly _pipelineExecutor: BasicPipelineExecutor;
  private readonly _depthRenderPipeline: CadGeometryRenderModePipelineProvider;
  private readonly _treeIndexRenderPipeline: CadGeometryRenderModePipelineProvider;
  private readonly _mutex = new Mutex();

  constructor(renderer: THREE.WebGLRenderer, materialManager: CadMaterialManager, sceneHandler: SceneHandler) {
    this._clearColor = new THREE.Color('black');
    this._clearAlpha = 0;
    this._raycaster = new THREE.Raycaster();

    this._pickPixelColorStorage = {
      renderTarget: new THREE.WebGLRenderTarget(1, 1),
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
    async = true
  ): Promise<IntersectCadNodesResult[]> {
    const results: IntersectCadNodesResult[] = [];

    // Exit when no cadNode exists
    if (cadNodes.length < 1) {
      return results;
    }
    const release = await this._mutex.acquire();
    const scene = new THREE.Scene();
    const depthInput = { ...input, scene, cadNodes };

    // Identify the treeIndex associated with the position.
    // Get CadNodes which are visible.
    const visibleCadNodes = cadNodes.filter(node => node.visible);
    // Filter nodes which cannot hit pick point.
    const filteredCadNodes = this.filterOutOfBoundCadNodes(visibleCadNodes, input);

    try {
      for (const cadNodeData of filteredCadNodes) {
        // Skip cad node when its bounds is further away than any already hit position.
        const minIntersectCadNodeDistance = cadNodeData.intersectPosition.distanceTo(input.camera.position);
        if (results.some(cadNodeResult => cadNodeResult.distance < minIntersectCadNodeDistance)) {
          continue;
        }

        // Make current CadNode visible & hide others
        visibleCadNodes.forEach(p => (p.visible = false));
        cadNodeData.cadNode.visible = true;
        const treeIndex = await this.intersectCadNodeTreeIndex(cadNodeData.cadNode, input, async);
        if (treeIndex) {
          // Assuming we have depth anywhere we hit a treeIndex
          const depthResult = await this.intersectCadNodeDepth(depthInput, async);
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

    function getIntersection(cadNode: CadNode, ray: THREE.Ray): [CadNode, THREE.Vector3 | null] {
      const nodeBounds = getWorldSpaceNodeBounds(cadNode);
      // If we are inside the box, set the intersection point to the ray origin point
      return [
        cadNode,
        nodeBounds.containsPoint(ray.origin) ? ray.origin : ray.intersectBox(nodeBounds, new THREE.Vector3())
      ];
    }

    function getWorldSpaceNodeBounds(node: CadNode): THREE.Box3 {
      const cadNodeBoundingBox = node.cadModelMetadata.scene.root.subtreeBoundingBox.clone();
      return cadNodeBoundingBox.applyMatrix4(node.cadModelMetadata.modelMatrix);
    }

    function hasIntersection(
      cadNodeIntersection: [CadNode, THREE.Vector3 | null]
    ): cadNodeIntersection is [CadNode, THREE.Vector3] {
      const intersectPosition = cadNodeIntersection[1];
      return intersectPosition !== null;
    }

    function byIntersectDistanceToCamera([_0, a]: [CadNode, THREE.Vector3], [_1, b]: [CadNode, THREE.Vector3]): number {
      return a.distanceToSquared(cameraPosition) - b.distanceToSquared(cameraPosition);
    }

    function data(cadNodeData: [CadNode, THREE.Vector3]): { cadNode: CadNode; intersectPosition: THREE.Vector3 } {
      return { cadNode: cadNodeData[0], intersectPosition: cadNodeData[1] };
    }
  }

  private async intersectCadNodeDepth(input: PickingInput, async: boolean) {
    const { camera } = input;
    const depth = await this.pickDepth(input, async);

    const viewZ = this.perspectiveDepthToViewZ(depth, camera.near, camera.far);
    const point = this.getPosition(input, viewZ);
    const distance = new THREE.Vector3().subVectors(point, camera.position).length();
    return {
      distance,
      point
    };
  }

  private async intersectCadNodeTreeIndex(
    cadNode: CadNode,
    input: IntersectInput,
    async: boolean
  ): Promise<number | undefined> {
    const { camera, normalizedCoords, renderer, domElement } = input;
    const pickingScene = new THREE.Scene();

    const pickInput = {
      normalizedCoords,
      camera,
      renderer,
      domElement,
      scene: pickingScene,
      cadNodes: [],
      cadNode
    };
    const treeIndex = await this.pickTreeIndex(pickInput, async);
    if (treeIndex === undefined) {
      return undefined;
    }
    return treeIndex;
  }

  private async pickTreeIndex(input: TreeIndexPickingInput, async: boolean): Promise<number | undefined> {
    const { cadNode } = input;
    const previousRenderMode = cadNode.renderMode;
    cadNode.renderMode = RenderMode.TreeIndex;
    let pixelBuffer: Uint8Array;
    try {
      pixelBuffer = await this.pickPixel(
        input,
        this._treeIndexRenderPipeline,
        this._clearColor,
        this._clearAlpha,
        async
      );
    } finally {
      cadNode.renderMode = previousRenderMode;
    }

    if (pixelBuffer[3] === 0) {
      return;
    }

    const treeIndex = pixelBuffer[0] * 255 * 255 + pixelBuffer[1] * 255 + pixelBuffer[2];

    return treeIndex;
  }

  private perspectiveDepthToViewZ(invClipZ: number, near: number, far: number) {
    return (near * far) / ((far - near) * invClipZ - far);
  }

  private async pickDepth(input: PickingInput, async: boolean): Promise<number> {
    const { cadNodes } = input;
    const previousRenderMode = cadNodes[0].renderMode;
    cadNodes.forEach(cadeNode => (cadeNode.renderMode = RenderMode.Depth));
    const pixelBuffer = await this.pickPixel(
      input,
      this._depthRenderPipeline,
      this._clearColor,
      this._clearAlpha,
      async
    );
    cadNodes.forEach(cadeNode => (cadeNode.renderMode = previousRenderMode));

    const depth = this.unpackRGBAToDepth(pixelBuffer);
    return depth;
  }

  private getPosition(input: PickingInput, viewZ: number): THREE.Vector3 {
    const { camera, normalizedCoords } = input;
    const position = new THREE.Vector3();
    position.set(normalizedCoords.x, normalizedCoords.y, 0.5).applyMatrix4(camera.projectionMatrixInverse);

    position.multiplyScalar(viewZ / position.z);
    position.applyMatrix4(camera.matrixWorld);
    return position;
  }

  private async pickPixel(
    input: PickingInput,
    renderPipeline: RenderPipelineProvider,
    clearColor: THREE.Color,
    clearAlpha: number,
    async: boolean
  ) {
    const { renderTarget, pixelBuffer } = this._pickPixelColorStorage;
    const { camera, normalizedCoords, renderer, domElement } = input;

    // Prepare camera that only renders the single pixel we are interested in
    const pickCamera = camera.clone() as THREE.PerspectiveCamera;
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
      readPixelsPromise =
        async === true
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
