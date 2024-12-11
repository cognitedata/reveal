import { Box3, Camera, Object3D, Plane, Points, Ray, Sphere, Vector3, WebGLRenderer } from 'three';
import { IPointCloudTreeGeometry } from '../geometry/IPointCloudTreeGeometry';
import { IPointCloudTreeGeometryNode } from '../geometry/IPointCloudTreeGeometryNode';
import { PointCloudOctreeNode } from './PointCloudOctreeNode';
import { PickParams, PointCloudOctreePicker } from './PointCloudOctreePicker';
import { PointCloudTree } from './PointCloudTree';
import { PickPoint } from '../types/types';
import { IPotree } from '../types/IPotree';
import { IPointCloudTreeNodeBase } from './IPointCloudTreeNodeBase';
import { IPointCloudTreeNode } from './IPointCloudTreeNode';
import { computeTransformedBoundingBox } from '../utils/bounds';

import { RenderLayer, PointCloudMaterial, PointSizeType, DEFAULT_MIN_NODE_PIXEL_SIZE } from '@reveal/rendering';
import { makeOnBeforeRender } from '../utils/utils';

export class PointCloudOctree extends PointCloudTree {
  potree: IPotree;
  disposed: boolean = false;
  pcoGeometry: IPointCloudTreeGeometry;
  boundingBox: Box3;
  boundingSphere: Sphere;
  material: PointCloudMaterial;
  level: number = 0;
  maxLevel: number = Infinity;
  /**
   * The minimum radius of a node's bounding sphere on the screen in order to be displayed.
   */
  minNodePixelSize: number = DEFAULT_MIN_NODE_PIXEL_SIZE;
  root: IPointCloudTreeNodeBase | undefined = undefined;
  visibleNodes: IPointCloudTreeNode[] = [];
  visibleGeometry: IPointCloudTreeGeometryNode[] = [];
  numVisiblePoints: number = 0;
  private readonly visibleBounds: Box3 = new Box3();
  private picker: PointCloudOctreePicker | undefined;

  private _globalClippingPlanes: Plane[] = [];
  private _localClippingPlanes: Plane[] = [];

  constructor(potree: IPotree, pcoGeometry: IPointCloudTreeGeometry, material: PointCloudMaterial) {
    super();

    this.name = '';
    this.potree = potree;
    this.root = pcoGeometry.root;
    this.pcoGeometry = pcoGeometry;
    this.boundingBox = pcoGeometry.boundingBox;
    this.boundingSphere = this.boundingBox.getBoundingSphere(new Sphere());

    this.position.copy(pcoGeometry.offset);

    this.material = material;
    this.updateMaterial();
  }

  private updateMaterial(): void {
    this.material.heightMin = this.pcoGeometry.tightBoundingBox.min.clone().applyMatrix4(this.matrixWorld).y;
    this.material.heightMax = this.pcoGeometry.tightBoundingBox.max.clone().applyMatrix4(this.matrixWorld).y;
  }

  public setGlobalClippingPlane(planes: Plane[]): void {
    this._globalClippingPlanes = planes.map(p => p.clone());
    this.updateClippingPlanes();
  }

  public setModelClippingPlane(planes: Plane[]): void {
    this._localClippingPlanes = planes.map(p => p.clone());
    this.updateClippingPlanes();
  }

  public updateClippingPlanes(): void {
    this.material.clippingPlanes = [...this._globalClippingPlanes, ...this._localClippingPlanes];

    this.material.defines = {
      ...this.material.defines,
      NUM_CLIPPING_PLANES: this.material.clippingPlanes.length
    };
    this.material.needsUpdate = true;
  }

  dispose(): void {
    if (this.root) {
      this.root.dispose();
    }

    this.pcoGeometry.root?.traverse(n => this.potree.lru.remove(n));
    this.pcoGeometry.dispose();

    this.visibleNodes = [];
    this.visibleGeometry = [];

    if (this.picker) {
      this.picker.dispose();
      this.picker = undefined;
    }

    this.disposed = true;
  }

  get pointSizeType(): PointSizeType {
    return this.material.pointSizeType;
  }

  set pointSizeType(value: PointSizeType) {
    this.material.pointSizeType = value;
  }

  toTreeNode(geometryNode: IPointCloudTreeGeometryNode, parent?: IPointCloudTreeNode | null): IPointCloudTreeNode {
    const points = new Points(geometryNode.geometry, this.material);
    const node = new PointCloudOctreeNode(geometryNode, points);
    points.name = geometryNode.name;
    points.position.copy(geometryNode.boundingBox.min);
    points.frustumCulled = false;
    points.onBeforeRender = makeOnBeforeRender(node, this.visibleNodes.indexOf(node));
    points.layers.set(RenderLayer.PointCloud);
    points.updateMatrix();

    if (parent) {
      parent.sceneNode.add(points);
      parent.children[geometryNode.index] = node;

      geometryNode.oneTimeDisposeHandlers.push(() => {
        node.disposeSceneNode();
        parent.sceneNode.remove(node.sceneNode);
        // Replace the tree node (rendered and in the GPU) with the geometry node.
        parent.children[geometryNode.index] = geometryNode;
      });
    } else {
      this.root = node;
      this.add(points);
    }

    return node;
  }

  updateVisibleBounds(): void {
    const bounds = this.visibleBounds;
    bounds.min.set(Infinity, Infinity, Infinity);
    bounds.max.set(-Infinity, -Infinity, -Infinity);

    for (const node of this.visibleNodes) {
      if (node.isLeafNode) {
        bounds.expandByPoint(node.boundingBox.min);
        bounds.expandByPoint(node.boundingBox.max);
      }
    }
  }

  updateMatricesForDescendants(): void {
    this.traverseVisible(node => node.matrixWorld.multiplyMatrices(this.matrixWorld, node.matrix));
  }

  /**
   * Override updateMatrixWorld to not update children recursively. Child transformations
   * are defined in relation to the base octree, and are instead updated using updateMatricesfordescendants()
   */
  override updateMatrixWorld(force: boolean): void {
    if (this.matrixWorldNeedsUpdate === true || force === true) {
      if (!this.parent) {
        this.matrixWorld.copy(this.matrix);
      } else {
        this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
      }

      this.matrixWorldNeedsUpdate = false;

      this.updateMaterial();
      this.updateMatricesForDescendants();
    }
  }

  hideDescendants(object: Object3D): void {
    const toHide: Object3D[] = [];
    addVisibleChildren(object);

    while (toHide.length > 0) {
      const objToHide = toHide.shift()!;
      objToHide.visible = false;
      addVisibleChildren(objToHide);
    }

    function addVisibleChildren(obj: Object3D) {
      for (const child of obj.children) {
        if (child.visible) {
          toHide.push(child);
        }
      }
    }
  }

  moveToOrigin(): void {
    this.position.set(0, 0, 0); // Reset, then the matrix will be updated in getBoundingBoxWorld()
    this.position.set(0, 0, 0).sub(this.getBoundingBoxWorld().getCenter(new Vector3()));
  }

  moveToGroundPlane(): void {
    this.position.y += -this.getBoundingBoxWorld().min.y;
  }

  getBoundingBoxWorld(): Box3 {
    this.updateMatrixWorld(true);
    return computeTransformedBoundingBox(this.boundingBox, this.matrixWorld);
  }

  getVisibleExtent(): Box3 {
    return this.visibleBounds.applyMatrix4(this.matrixWorld);
  }

  pick(renderer: WebGLRenderer, camera: Camera, ray: Ray, params: Partial<PickParams> = {}): PickPoint | null {
    this.picker = this.picker || new PointCloudOctreePicker(renderer);
    return this.picker.pick(camera, ray, [this], params);
  }

  get progress(): number {
    return this.visibleGeometry.length === 0 ? 0 : this.visibleNodes.length / this.visibleGeometry.length;
  }
}
