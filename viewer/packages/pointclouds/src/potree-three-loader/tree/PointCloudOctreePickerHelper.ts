import {
  BufferAttribute,
  Camera,
  LinearFilter,
  NearestFilter,
  NoBlending,
  Points,
  Ray,
  RGBAFormat,
  Scene,
  Sphere,
  Vector3,
  Vector4,
  WebGLRenderer,
  WebGLRenderTarget
} from 'three';
import { OctreeMaterialParams, PointCloudMaterial, PointColorType, COLOR_BLACK } from '@reveal/rendering';
import { PointCloudOctree } from './PointCloudOctree';
import { IPointCloudTreeNode } from './IPointCloudTreeNode';
import { PickPoint, PointCloudHit } from '../types/types';
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
    pickWndSize: number,
    pickMaterial: PointCloudMaterial,
    pickState: IPickState
  ): void {
    const renderer = this._renderer;
    const stateHelper = this._rendererStateHelper;

    // Render the intersected nodes onto the pick render target, clipping to a small pick window.
    stateHelper.setScissor(x, y, pickWndSize, pickWndSize);
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
    ray: Ray,
    pickState: IPickState,
    params: Partial<PickParams>
  ): RenderedNode[] {
    const renderer = this._renderer;

    const renderedNodes: RenderedNode[] = [];
    for (const octree of octrees) {
      // Get all the octree nodes which intersect the picking ray. We only need to render those.
      const nodes = PointCloudOctreePickerHelper.nodesOnRay(octree, ray);
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
        renderedNodes.length
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

  public readPixels(x: number, y: number, pickWndSize: number): Uint8Array {
    // Read the pixel from the pick render target.
    // TODO 2022-06-20 larsmoa: Replace with async picking
    const pixels = new Uint8Array(4 * pickWndSize * pickWndSize);
    this._renderer.readRenderTargetPixels(this._renderer.getRenderTarget()!, x, y, pickWndSize, pickWndSize, pixels);
    return pixels;
  }

  private static createTempNodes(
    nodes: IPointCloudTreeNode[],
    pickMaterial: PointCloudMaterial,
    nodeIndexOffset: number
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
      if (nodeIndex > 255) {
        console.error('More than 255 nodes for pick are not supported.');
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

  public static findHit(
    pixels: Uint8Array,
    pickWndSize: number,
    nodes: RenderedNode[],
    camera: Camera
  ): PointCloudHit | null {
    const ibuffer = new Uint32Array(pixels.buffer);

    // Find closest hit inside pixelWindow boundaries and closest to the camera.
    let minScreen = Number.MAX_VALUE;
    let minCameraDistance = Number.MAX_VALUE;
    let hit: PointCloudHit | null = null;
    for (let u = 0; u < pickWndSize; u++) {
      for (let v = 0; v < pickWndSize; v++) {
        const offset = u + v * pickWndSize;
        const screenDistance = Math.pow(u - (pickWndSize - 1) / 2, 2) + Math.pow(v - (pickWndSize - 1) / 2, 2);

        const pcIndex = pixels[4 * offset + 3];

        // Set pcIndex bit to 0 for proper conversion to pointIndex afterwards.
        pixels[4 * offset + 3] = 0;
        const pIndex = ibuffer[offset];

        if (pcIndex > 0 && pcIndex !== 255 && screenDistance <= minScreen) {
          const pointPosition = PointCloudOctreePickerHelper.getPointPosition(nodes, pcIndex - 1, pIndex);
          const distanceToCamera = pointPosition.distanceToSquared(camera.position);

          if (distanceToCamera < minCameraDistance) {
            hit = {
              pIndex: pIndex,
              pcIndex: pcIndex - 1
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
