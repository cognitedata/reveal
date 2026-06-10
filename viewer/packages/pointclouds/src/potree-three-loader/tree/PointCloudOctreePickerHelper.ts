import type { BufferAttribute, Camera, Ray, WebGLRenderer } from 'three';
import {
  LinearFilter,
  NearestFilter,
  NoBlending,
  Points,
  RGBAFormat,
  Scene,
  Sphere,
  Vector3,
  Vector4,
  WebGLRenderTarget
} from 'three';
import type { OctreeMaterialParams } from '@reveal/rendering';
import { PointCloudMaterial, PointColorType, COLOR_BLACK, DEFAULT_NODE_INDEX_BITS } from '@reveal/rendering';
import type { PointCloudOctree } from './PointCloudOctree';
import type { IPointCloudTreeNode } from './IPointCloudTreeNode';
import type { PickPoint, PointCloudHit } from '../types/types';
import { WebGLRendererStateHelper } from '@reveal/utilities';
import { createVisibilityTextureData, makeOnBeforeRender } from '../utils/utils';

export interface RenderedNode {
  node: IPointCloudTreeNode;
  octree: PointCloudOctree;
}

export interface IPickState {
  renderTarget: WebGLRenderTarget;
  material: PointCloudMaterial;
  scene: Scene;
}

export interface PickParams {
  pickWindowSize: number;
  pickOutsideClipRegion: boolean;
  /**
   * If provided, the picking will use this pixel position instead of the `Ray` passed to the `pick`
   * method.
   */
  pixelPosition: Vector3;
  /**
   * Function which gets called after a picking material has been created and setup and before the
   * point cloud is rendered into the picking render target. This gives applications a chance to
   * customize the renderTarget and the material.
   *
   * @param material The pick material.
   * @param renterTarget The render target used for picking.
   */
  onBeforePickRender: (material: PointCloudMaterial, renterTarget: WebGLRenderTarget) => void;
}

/**
 * Helper class for PointCloudOctreePicker.
 */
export class PointCloudOctreePickerHelper {
  private static readonly helperVec3 = new Vector3();
  private static readonly helperSphere = new Sphere();

  private readonly _renderer: WebGLRenderer;
  private readonly _rendererStateHelper: WebGLRendererStateHelper;

  constructor(renderer: WebGLRenderer) {
    this._renderer = renderer;
    this._rendererStateHelper = new WebGLRendererStateHelper(renderer);
  }

  resetState(): void {
    this._rendererStateHelper.resetState();
  }

  public prepareRender(
    x: number,
    y: number,
    width: number,
    height: number,
    pickMaterial: PointCloudMaterial,
    pickState: IPickState
  ): void {
    const renderer = this._renderer;
    const stateHelper = this._rendererStateHelper;

    // Render the intersected nodes onto the pick render target, clipping to the pick window
    // (a small window around the pick position, or the full frame when building the pick cache).
    stateHelper.setScissor(x, y, width, height);
    stateHelper.setScissorTest(true);
    stateHelper.setWebGLState({
      buffers: {
        depth: {
          test: pickMaterial.depthTest,
          mask: pickMaterial.depthWrite
        }
      }
    });
    renderer.state.setBlending(NoBlending);

    stateHelper.setRenderTarget(pickState.renderTarget);

    stateHelper.setClearColor(COLOR_BLACK, 0);
    renderer.clear(true, true, true);
  }

  public render(
    camera: Camera,
    pickMaterial: PointCloudMaterial,
    octrees: PointCloudOctree[],
    ray: Ray | undefined,
    pickState: IPickState,
    params: Partial<PickParams>,
    nodeIndexBits: number = DEFAULT_NODE_INDEX_BITS
  ): RenderedNode[] {
    const renderer = this._renderer;

    // Node index 0 means "no hit" and the all-ones value is rejected by findHit, so the
    // largest usable index is 2^nodeIndexBits - 2.
    const maxNodeIndex = 2 ** nodeIndexBits - 2;
    pickMaterial.nodeIndexBits = nodeIndexBits;

    const renderedNodes: RenderedNode[] = [];
    for (const octree of octrees) {
      // Get all the octree nodes which intersect the picking ray (we only need to render those),
      // or every visible node when no ray is given (full-frame pick).
      const nodes =
        ray !== undefined ? PointCloudOctreePickerHelper.nodesOnRay(octree, ray) : [...octree.visibleNodes];
      if (!nodes.length) {
        continue;
      }

      const visibilityTextureData = createVisibilityTextureData(
        octree.visibleNodes,
        octree.material.visibleNodeTextureOffsets
      );
      const octreeMaterialParams: OctreeMaterialParams = {
        scale: octree.scale,
        boundingBox: octree.pcoGeometry.boundingBox,
        spacing: octree.pcoGeometry.spacing
      };

      PointCloudOctreePickerHelper.updatePickMaterial(pickMaterial, octree.material);
      pickMaterial.updateMaterial(octreeMaterialParams, visibilityTextureData, camera);

      if (params.onBeforePickRender) {
        params.onBeforePickRender(pickMaterial, pickState.renderTarget);
      }

      // Create copies of the nodes so we can render them differently than in the normal point cloud.
      pickState.scene.children = PointCloudOctreePickerHelper.createTempNodes(
        nodes,
        pickMaterial,
        renderedNodes.length,
        maxNodeIndex
      );

      renderer.render(pickState.scene, camera);

      // Reset children, avoid keeping references to point cloud nodes
      pickState.scene.children = [];
      nodes.forEach(node => renderedNodes.push({ node, octree }));
    }
    return renderedNodes;
  }

  private static nodesOnRay(octree: PointCloudOctree, ray: Ray): IPointCloudTreeNode[] {
    const nodesOnRay: IPointCloudTreeNode[] = [];

    const rayClone = ray.clone();
    for (const node of octree.visibleNodes) {
      const sphere = PointCloudOctreePickerHelper.helperSphere
        .copy(node.boundingSphere)
        .applyMatrix4(octree.matrixWorld);

      if (rayClone.intersectsSphere(sphere)) {
        nodesOnRay.push(node);
      }
    }

    return nodesOnRay;
  }

  public readPixelsAsync(
    x: number,
    y: number,
    width: number,
    height: number,
    renderTarget: WebGLRenderTarget,
    pixels: Uint8Array = new Uint8Array(4 * width * height)
  ): Promise<Uint8Array> {
    return this._renderer.readRenderTargetPixelsAsync(renderTarget, x, y, width, height, pixels).then(() => pixels);
  }

  private static createTempNodes(
    nodes: IPointCloudTreeNode[],
    pickMaterial: PointCloudMaterial,
    nodeIndexOffset: number,
    maxNodeIndex: number
  ): Points[] {
    const tempNodes: Points[] = [];
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const sceneNode = node.sceneNode;
      const tempNode = new Points(sceneNode.geometry, pickMaterial);
      tempNode.matrix = sceneNode.matrix;
      tempNode.matrixWorld = sceneNode.matrixWorld;
      tempNode.matrixAutoUpdate = false;
      tempNode.frustumCulled = false;
      const nodeIndex = nodeIndexOffset + i + 1;
      if (nodeIndex > maxNodeIndex) {
        console.error(`More than ${maxNodeIndex} nodes for pick are not supported.`);
      }
      tempNode.onBeforeRender = makeOnBeforeRender(node, nodeIndex);

      tempNodes.push(tempNode);
    }
    return tempNodes;
  }

  private static updatePickMaterial(pickMaterial: PointCloudMaterial, nodeMaterial: PointCloudMaterial): void {
    pickMaterial.pointSizeType = nodeMaterial.pointSizeType;
    pickMaterial.shape = nodeMaterial.shape;
    pickMaterial.size = nodeMaterial.size;
    pickMaterial.minSize = nodeMaterial.minSize;
    pickMaterial.maxSize = nodeMaterial.maxSize;
    pickMaterial.classification = nodeMaterial.classification;
    pickMaterial.objectAppearanceTexture = nodeMaterial.objectAppearanceTexture;

    pickMaterial.clippingPlanes = nodeMaterial.clippingPlanes;
    pickMaterial.clipping = nodeMaterial.clipping;
    pickMaterial.clipIntersection = nodeMaterial.clipIntersection;
    pickMaterial.defines = nodeMaterial.defines;

    pickMaterial.visibleNodeTextureOffsets = nodeMaterial.visibleNodeTextureOffsets;
  }

  public static updatePickRenderTarget(pickState: IPickState, width: number, height: number): void {
    if (pickState.renderTarget.width === width && pickState.renderTarget.height === height) {
      return;
    }

    pickState.renderTarget.dispose();
    pickState.renderTarget = PointCloudOctreePickerHelper.makePickRenderTarget();
    pickState.renderTarget.setSize(width, height);
  }

  private static makePickRenderTarget() {
    return new WebGLRenderTarget(1, 1, {
      minFilter: LinearFilter,
      magFilter: NearestFilter,
      format: RGBAFormat
    });
  }

  /**
   * Computes how to split the packed 32-bit pick value between node index (high bits) and
   * point index (low bits) for a given node set. Returns undefined if the node set cannot be
   * represented in 32 bits (caller should fall back to a smaller, e.g. ray-culled, node set).
   */
  public static computeBitSplit(nodeCount: number, maxPointsPerNode: number): number | undefined {
    // Usable node indices are 1..2^bits - 2 (0 = background, all-ones rejected by findHit).
    const nodeIndexBits = Math.max(DEFAULT_NODE_INDEX_BITS, Math.ceil(Math.log2(nodeCount + 2)));
    if (nodeIndexBits >= 32 || maxPointsPerNode > 2 ** (32 - nodeIndexBits)) {
      return undefined;
    }
    return nodeIndexBits;
  }

  public static decodePackedPixel(
    packedIndex: number,
    nodeIndexBits: number
  ): { nodeIndex: number; pointIndex: number } {
    const pointIndexBits = 32 - nodeIndexBits;
    // Arithmetic instead of bit ops: packedIndex is an unsigned 32-bit value which JS bitwise
    // operators would coerce to signed 32-bit.
    const nodeIndex = Math.floor(packedIndex / 2 ** pointIndexBits);
    const pointIndex = packedIndex % 2 ** pointIndexBits;
    return { nodeIndex, pointIndex };
  }

  public static findHit(
    pixels: Uint8Array,
    pickWndSize: number,
    nodes: RenderedNode[],
    camera: Camera,
    nodeIndexBits: number = DEFAULT_NODE_INDEX_BITS
  ): PointCloudHit | null {
    const ibuffer = new Uint32Array(pixels.buffer, pixels.byteOffset, pixels.byteLength / 4);
    const center = (pickWndSize - 1) / 2;
    return PointCloudOctreePickerHelper.findHitInBuffer(
      ibuffer,
      pickWndSize,
      pickWndSize,
      center,
      center,
      pickWndSize,
      nodes,
      camera,
      nodeIndexBits
    );
  }

  /**
   * Finds the best hit in a window of the given size centered at (centerX, centerY) inside a
   * pick buffer of bufferWidth x bufferHeight packed 32-bit pixels. "Best" preserves the
   * original picker semantics: closest to the window center on screen, then closest to the camera.
   */
  public static findHitInBuffer(
    ibuffer: Uint32Array,
    bufferWidth: number,
    bufferHeight: number,
    centerX: number,
    centerY: number,
    windowSize: number,
    nodes: RenderedNode[],
    camera: Camera,
    nodeIndexBits: number
  ): PointCloudHit | null {
    const maxNodeIndex = 2 ** nodeIndexBits - 1;
    const half = (windowSize - 1) / 2;
    const xMin = Math.max(0, Math.round(centerX - half));
    const xMax = Math.min(bufferWidth - 1, Math.round(centerX + half));
    const yMin = Math.max(0, Math.round(centerY - half));
    const yMax = Math.min(bufferHeight - 1, Math.round(centerY + half));

    // Find closest hit inside pixelWindow boundaries and closest to the camera.
    let minScreen = Number.MAX_VALUE;
    let minCameraDistance = Number.MAX_VALUE;
    let hit: PointCloudHit | null = null;
    for (let x = xMin; x <= xMax; x++) {
      for (let y = yMin; y <= yMax; y++) {
        const offset = x + y * bufferWidth;
        const screenDistance = Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2);

        const { nodeIndex, pointIndex } = PointCloudOctreePickerHelper.decodePackedPixel(
          ibuffer[offset],
          nodeIndexBits
        );

        if (nodeIndex > 0 && nodeIndex !== maxNodeIndex && screenDistance <= minScreen) {
          const pointPosition = PointCloudOctreePickerHelper.getPointPosition(nodes, nodeIndex - 1, pointIndex);
          const distanceToCamera = pointPosition.distanceToSquared(camera.position);

          if (distanceToCamera < minCameraDistance) {
            hit = {
              pIndex: pointIndex,
              pcIndex: nodeIndex - 1
            };

            minScreen = screenDistance;
            minCameraDistance = distanceToCamera;
          }
        }
      }
    }
    return hit;
  }

  public static getPickPoint(hit: PointCloudHit | null, nodes: RenderedNode[]): PickPoint | null {
    if (!hit) {
      return null;
    }

    const points = nodes[hit.pcIndex]?.node.sceneNode;
    if (!points) {
      return null;
    }

    const point: PickPoint = { pointIndex: hit.pIndex, object: points, position: new Vector3() };

    point.pointCloud = nodes[hit.pcIndex].octree;

    const attributes = points.geometry.attributes;

    for (const property in attributes) {
      if (!attributes.hasOwnProperty(property)) {
        continue;
      }

      const values = attributes[property] as BufferAttribute;

      // tslint:disable-next-line:prefer-switch
      if (property === 'position') {
        PointCloudOctreePickerHelper.addPositionToPickPoint(point, hit, values, points);
      } else if (property === 'normal') {
        PointCloudOctreePickerHelper.addNormalToPickPoint(point, hit, values, points);
      } else if (property === 'indices') {
        // TODO
      } else {
        if (values.itemSize === 1) {
          point[property] = values.array[hit.pIndex];
        } else {
          const value: number[] = [];
          for (let j = 0; j < values.itemSize; j++) {
            value.push(values.array[values.itemSize * hit.pIndex + j]);
          }
          point[property] = value;
        }
      }
    }

    return point;
  }

  public static getPointPosition(nodes: RenderedNode[], pcIndex: number, pIndex: number): Vector3 {
    const points = nodes[pcIndex]?.node.sceneNode;

    if (!points) throw new Error('Point cloud not found');

    return this.helperVec3
      .fromBufferAttribute(points.geometry.attributes['position'] as BufferAttribute, pIndex)
      .applyMatrix4(points.matrixWorld);
  }

  private static addPositionToPickPoint(
    point: PickPoint,
    hit: PointCloudHit,
    values: BufferAttribute,
    points: Points
  ): void {
    point.position = new Vector3().fromBufferAttribute(values, hit.pIndex).applyMatrix4(points.matrixWorld);
  }

  private static addNormalToPickPoint(
    point: PickPoint,
    hit: PointCloudHit,
    values: BufferAttribute,
    points: Points
  ): void {
    const normal = new Vector3().fromBufferAttribute(values, hit.pIndex);
    const normal4 = new Vector4(normal.x, normal.y, normal.z, 0).applyMatrix4(points.matrixWorld);
    normal.set(normal4.x, normal4.y, normal4.z);

    point.normal = normal;
  }

  public static getPickState(): IPickState {
    const scene = new Scene();
    scene.matrixWorldAutoUpdate = false;

    const material = new PointCloudMaterial();
    material.pointColorType = PointColorType.PointIndex;

    return {
      renderTarget: PointCloudOctreePickerHelper.makePickRenderTarget(),
      material: material,
      scene: scene
    };
  }
}
