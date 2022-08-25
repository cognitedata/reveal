import {
  Box3,
  Camera,
  Frustum,
  Matrix4,
  OrthographicCamera,
  PerspectiveCamera,
  Vector2,
  Vector3,
  WebGLRenderer
} from 'three';
import {
  DEFAULT_POINT_BUDGET,
  MAX_LOADS_TO_GPU,
  MAX_NUM_NODES_LOADING,
  PERSPECTIVE_CAMERA,
  UPDATE_THROTTLE_TIME_MS
} from './rendering/constants';
import { FEATURES } from './rendering/features';
import { EptLoader } from './loading/EptLoader';
import { EptBinaryLoader } from './loading/EptBinaryLoader';
import { ClipMode } from './rendering';
import { PointCloudOctree } from './tree/PointCloudOctree';
import { isGeometryNode, isTreeNode, isOptionalTreeNode } from './types/type-predicates';
import { IPotree } from './types/IPotree';
import { IVisibilityUpdateResult } from './types/IVisibilityUpdateResult';
import { IPointCloudTreeNodeBase } from './tree/IPointCloudTreeNodeBase';
import { IPointCloudTreeNode } from './tree/IPointCloudTreeNode';
import { IPointCloudTreeGeometryNode } from './geometry/IPointCloudTreeGeometryNode';
import { BinaryHeap } from './utils/BinaryHeap';
import { Box3Helper } from './utils/box3-helper';
import { LRU } from './utils/lru';
import { ModelDataProvider } from '@reveal/modeldata-api';
import { PointCloudObjectProvider } from '../styling/PointCloudObjectProvider';
import throttle from 'lodash/throttle';

export class QueueItem {
  constructor(
    public pointCloudIndex: number,
    public weight: number,
    public node: IPointCloudTreeNodeBase,
    public parent?: IPointCloudTreeNodeBase | undefined
  ) {}
}

type VisibilityUpdateInfo = {
  loadedToGPUThisFrame: number;
  exceededMaxLoadsToGPU: boolean;
  nodeLoadFailed: boolean;
  numVisiblePoints: number;
  unloadedGeometry: IPointCloudTreeGeometryNode[];
  visibleNodes: IPointCloudTreeNodeBase[];
  priorityQueue: BinaryHeap<QueueItem>;
};

type VisibilitySceneParameters = {
  pointClouds: PointCloudOctree[];
  frustums: Frustum[];
  camera: Camera;
  cameraPositions: Vector3[];
  renderer: WebGLRenderer;
};

export class Potree implements IPotree {
  private _pointBudget: number = DEFAULT_POINT_BUDGET;
  private readonly _rendererSize: Vector2 = new Vector2();
  private readonly _modelDataProvider: ModelDataProvider;

  private readonly _throttledUpdateFunc = throttle(
    (pointClouds: PointCloudOctree[], camera: THREE.Camera, renderer: WebGLRenderer) =>
      this.innerUpdatePointClouds(pointClouds, camera, renderer),
    UPDATE_THROTTLE_TIME_MS
  );

  maxNumNodesLoading: number = MAX_NUM_NODES_LOADING;
  features = FEATURES;
  lru = new LRU(this._pointBudget);

  constructor(modelDataProvider: ModelDataProvider) {
    this._modelDataProvider = modelDataProvider;
  }

  async loadPointCloud(
    baseUrl: string,
    fileName: string,
    annotationObjectInfo: PointCloudObjectProvider
  ): Promise<PointCloudOctree> {
    const rawObjects = annotationObjectInfo.createRawObjectArray();

    const geometry = await EptLoader.load(baseUrl, fileName, this._modelDataProvider, rawObjects);
    return new PointCloudOctree(this, geometry, annotationObjectInfo);
  }

  updatePointClouds(pointClouds: PointCloudOctree[], camera: Camera, renderer: WebGLRenderer): void {
    this._throttledUpdateFunc(pointClouds, camera, renderer);
  }

  private innerUpdatePointClouds(
    pointClouds: PointCloudOctree[],
    camera: Camera,
    renderer: WebGLRenderer
  ): IVisibilityUpdateResult {
    const result = this.updateVisibility(pointClouds, camera, renderer);

    for (let i = 0; i < pointClouds.length; i++) {
      const pointCloud = pointClouds[i];
      if (pointCloud.disposed) {
        continue;
      }

      pointCloud.material.updateMaterial(pointCloud, pointCloud.visibleNodes, camera, renderer);
      pointCloud.updateVisibleBounds();
      pointCloud.updateBoundingBoxes();
    }

    this.lru.freeMemory();

    return result;
  }

  get pointBudget(): number {
    return this._pointBudget;
  }

  set pointBudget(value: number) {
    if (value !== this._pointBudget) {
      this._pointBudget = value;
      this.lru.pointBudget = value;
      this.lru.freeMemory();
    }
  }

  static set maxLoaderWorkers(value: number) {
    EptBinaryLoader.WORKER_POOL.maxWorkers = value;
  }

  static get maxLoaderWorkers(): number {
    return EptBinaryLoader.WORKER_POOL.maxWorkers;
  }

  private updateVisibilityForNode(
    node: IPointCloudTreeNodeBase,
    updateInfo: VisibilityUpdateInfo,
    queueItem: QueueItem,
    sceneParams: VisibilitySceneParameters
  ): void {
    const pointCloudIndex = queueItem.pointCloudIndex;
    const pointCloud = sceneParams.pointClouds[pointCloudIndex];

    const maxLevel = pointCloud.maxLevel !== undefined ? pointCloud.maxLevel : Infinity;

    if (
      node.level > maxLevel ||
      !sceneParams.frustums[pointCloudIndex].intersectsBox(node.boundingBox) ||
      this.shouldClip(pointCloud, node.boundingBox)
    ) {
      return;
    }

    updateInfo.numVisiblePoints += node.numPoints;
    pointCloud.numVisiblePoints += node.numPoints;

    const parentNode = queueItem.parent;
    if (isGeometryNode(node) && isOptionalTreeNode(parentNode)) {
      if (node.loaded && updateInfo.loadedToGPUThisFrame < MAX_LOADS_TO_GPU) {
        node = pointCloud.toTreeNode(node, parentNode);
        updateInfo.loadedToGPUThisFrame++;
      } else if (!node.failed) {
        if (node.loaded && updateInfo.loadedToGPUThisFrame >= MAX_LOADS_TO_GPU) {
          updateInfo.exceededMaxLoadsToGPU = true;
        }
        updateInfo.unloadedGeometry.push(node);
        pointCloud.visibleGeometry.push(node);
      } else {
        updateInfo.nodeLoadFailed = true;
        return;
      }
    }

    if (isTreeNode(node)) {
      this.updateTreeNodeVisibility(pointCloud, node, updateInfo.visibleNodes);
      pointCloud.visibleGeometry.push(node.geometryNode);
    }

    const halfHeight =
      0.5 * sceneParams.renderer.getSize(this._rendererSize).height * sceneParams.renderer.getPixelRatio();

    this.updateChildVisibility(
      queueItem,
      updateInfo.priorityQueue,
      pointCloud,
      node,
      sceneParams.cameraPositions[pointCloudIndex],
      sceneParams.camera,
      halfHeight
    );
  }

  private createVisibilityUpdateResult(
    updateInfo: VisibilityUpdateInfo,
    nodeLoadPromises: Promise<void>[]
  ): IVisibilityUpdateResult {
    return {
      visibleNodes: updateInfo.visibleNodes,
      numVisiblePoints: updateInfo.numVisiblePoints,
      exceededMaxLoadsToGPU: updateInfo.exceededMaxLoadsToGPU,
      nodeLoadFailed: updateInfo.nodeLoadFailed,
      nodeLoadPromises: nodeLoadPromises
    };
  }

  private updateVisibility(
    pointClouds: PointCloudOctree[],
    camera: Camera,
    renderer: WebGLRenderer
  ): IVisibilityUpdateResult {
    // calculate object space frustum and cam pos and setup priority queue
    const { frustums, cameraPositions, priorityQueue } = this.updateVisibilityStructures(pointClouds, camera);

    const updateInfo: VisibilityUpdateInfo = {
      loadedToGPUThisFrame: 0,
      exceededMaxLoadsToGPU: false,
      nodeLoadFailed: false,
      numVisiblePoints: 0,
      unloadedGeometry: [],
      visibleNodes: [],
      priorityQueue
    };

    let queueItem = priorityQueue.pop();

    if (!queueItem) {
      return this.createVisibilityUpdateResult(updateInfo, []);
    }

    const sceneParams: VisibilitySceneParameters = {
      pointClouds,
      frustums,
      camera,
      cameraPositions,
      renderer
    };

    // Ensure root node is always enqueued as a visible node, as it is never unloaded
    // even when budget is 0
    this.updateVisibilityForNode(queueItem.node, updateInfo, queueItem, sceneParams);

    while ((queueItem = priorityQueue.pop()) !== undefined) {
      const node = queueItem.node;

      // If we will end up with too many points, we stop right away.
      if (updateInfo.numVisiblePoints + node.numPoints > this.pointBudget) {
        break;
      }
      this.updateVisibilityForNode(node, updateInfo, queueItem, sceneParams);
    } // end priority queue loop

    const numNodesToLoad = Math.min(this.maxNumNodesLoading, updateInfo.unloadedGeometry.length);
    const nodeLoadPromises: Promise<void>[] = [];
    for (let i = 0; i < numNodesToLoad; i++) {
      nodeLoadPromises.push(
        updateInfo.unloadedGeometry[i].load().then(() => {
          this._throttledUpdateFunc(pointClouds, camera, renderer);
        })
      );
    }

    return this.createVisibilityUpdateResult(updateInfo, nodeLoadPromises);
  }

  private updateTreeNodeVisibility(
    pointCloud: PointCloudOctree,
    node: IPointCloudTreeNode,
    visibleNodes: IPointCloudTreeNodeBase[]
  ): void {
    this.lru.touch(node.geometryNode);

    const sceneNode = node.sceneNode;
    sceneNode.visible = true;
    sceneNode.material = pointCloud.material;
    sceneNode.updateMatrix();
    sceneNode.matrixWorld.multiplyMatrices(pointCloud.matrixWorld, sceneNode.matrix);

    visibleNodes.push(node);
    pointCloud.visibleNodes.push(node);

    this.updateBoundingBoxVisibility(pointCloud, node);
  }

  private updateChildVisibility(
    queueItem: QueueItem,
    priorityQueue: BinaryHeap<QueueItem>,
    pointCloud: PointCloudOctree,
    node: IPointCloudTreeNodeBase,
    cameraPosition: Vector3,
    camera: Camera,
    halfHeight: number
  ): void {
    const children = node.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (!child) {
        continue;
      }

      const sphere = child.boundingSphere;
      const distance = sphere.center.distanceTo(cameraPosition);
      const radius = sphere.radius;

      let projectionFactor = 0.0;

      if (camera.type === PERSPECTIVE_CAMERA) {
        const perspective = camera as PerspectiveCamera;
        const fov = (perspective.fov * Math.PI) / 180.0;
        const slope = Math.tan(fov / 2.0);
        projectionFactor = halfHeight / (slope * distance);
      } else {
        const orthographic = camera as OrthographicCamera;
        projectionFactor = (2 * halfHeight) / (orthographic.top - orthographic.bottom);
      }

      const screenPixelRadius = radius * projectionFactor;

      // Don't add the node if it'll be too small on the screen.
      if (screenPixelRadius < pointCloud.minNodePixelSize) {
        continue;
      }

      // Nodes which are larger will have priority in loading/displaying.
      const weight = distance < radius ? Number.MAX_VALUE : screenPixelRadius + 1 / distance;

      priorityQueue.push(new QueueItem(queueItem.pointCloudIndex, weight, child, node));
    }
  }

  private updateBoundingBoxVisibility(pointCloud: PointCloudOctree, node: IPointCloudTreeNode): void {
    if (pointCloud.showBoundingBox && !node.boundingBoxNode) {
      const boxHelper = new Box3Helper(node.boundingBox);
      boxHelper.matrixAutoUpdate = false;
      pointCloud.boundingBoxNodes.push(boxHelper);
      node.boundingBoxNode = boxHelper;
      node.boundingBoxNode.matrix.copy(pointCloud.matrixWorld);
    } else if (pointCloud.showBoundingBox && node.boundingBoxNode) {
      node.boundingBoxNode.visible = true;
      node.boundingBoxNode.matrix.copy(pointCloud.matrixWorld);
    } else if (!pointCloud.showBoundingBox && node.boundingBoxNode) {
      node.boundingBoxNode.visible = false;
    }
  }

  private shouldClip(pointCloud: PointCloudOctree, boundingBox: Box3): boolean {
    const material = pointCloud.material;

    if (material.numClipBoxes === 0 || material.clipMode !== ClipMode.CLIP_OUTSIDE) {
      return false;
    }

    const box2 = boundingBox.clone();
    pointCloud.updateMatrixWorld(true);
    box2.applyMatrix4(pointCloud.matrixWorld);

    const clipBoxes = material.clipBoxes;
    for (let i = 0; i < clipBoxes.length; i++) {
      const clipMatrixWorld = clipBoxes[i].matrix;
      const clipBoxWorld = new Box3(new Vector3(-0.5, -0.5, -0.5), new Vector3(0.5, 0.5, 0.5)).applyMatrix4(
        clipMatrixWorld
      );
      if (box2.intersectsBox(clipBoxWorld)) {
        return false;
      }
    }

    return true;
  }

  private readonly updateVisibilityStructures = (() => {
    const frustumMatrix = new Matrix4();
    const inverseWorldMatrix = new Matrix4();
    const cameraMatrix = new Matrix4();

    return (
      pointClouds: PointCloudOctree[],
      camera: Camera
    ): {
      frustums: Frustum[];
      cameraPositions: Vector3[];
      priorityQueue: BinaryHeap<QueueItem>;
    } => {
      const frustums: Frustum[] = [];
      const cameraPositions: Vector3[] = [];
      const priorityQueue = new BinaryHeap<QueueItem>(x => 1 / x.weight);

      for (let i = 0; i < pointClouds.length; i++) {
        const pointCloud = pointClouds[i];

        if (!pointCloud.initialized()) {
          continue;
        }

        pointCloud.numVisiblePoints = 0;
        pointCloud.visibleNodes = [];
        pointCloud.visibleGeometry = [];

        camera.updateMatrixWorld(false);

        // Furstum in object space.
        const inverseViewMatrix = camera.matrixWorldInverse;
        const worldMatrix = pointCloud.matrixWorld;
        frustumMatrix.identity().multiply(camera.projectionMatrix).multiply(inverseViewMatrix).multiply(worldMatrix);
        frustums.push(new Frustum().setFromProjectionMatrix(frustumMatrix));

        // Camera position in object space
        inverseWorldMatrix.copy(worldMatrix).invert();
        cameraMatrix.identity().multiply(inverseWorldMatrix).multiply(camera.matrixWorld);
        cameraPositions.push(new Vector3().setFromMatrixPosition(cameraMatrix));

        if (pointCloud.visible && pointCloud.root !== null) {
          const weight = Number.MAX_VALUE;
          priorityQueue.push(new QueueItem(i, weight, pointCloud.root!));
        }

        // Hide any previously visible nodes. We will later show only the needed ones.
        if (isTreeNode(pointCloud.root)) {
          pointCloud.hideDescendants(pointCloud.root!.sceneNode);
        }

        for (const boundingBoxNode of pointCloud.boundingBoxNodes) {
          boundingBoxNode.visible = false;
        }
      }

      return { frustums, cameraPositions, priorityQueue };
    };
  })();
}
