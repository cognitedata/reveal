import { Box3, BufferGeometry, EventDispatcher, Object3D, Points, Sphere } from 'three';
import { IPointCloudTreeGeometryNode } from './types/IPointCloudTreeGeometryNode';
import { IPointCloudTreeNode } from './types/IPointCloudTreeNode';
import { IPointCloudTreeNodeBase } from './types/IPointCloudTreeNodeBase';

export class PointCloudOctreeNode extends EventDispatcher implements IPointCloudTreeNode {
  geometryNode: IPointCloudTreeGeometryNode;
  sceneNode: Points;
  pcIndex: number | undefined = undefined;
  boundingBoxNode?: Object3D | undefined = undefined;
  readonly children: (IPointCloudTreeNodeBase | null)[];
  readonly loaded = true;
  readonly isTreeNode: boolean = true;
  readonly isGeometryNode: boolean = false;

  constructor(geometryNode: IPointCloudTreeGeometryNode, sceneNode: Points) {
    super();

    this.geometryNode = geometryNode;
    this.sceneNode = sceneNode;
    this.children = geometryNode.children.slice();
  }

  dispose(): void {
    this.geometryNode.dispose();
  }

  disposeSceneNode(): void {
    const node = this.sceneNode;

    if (node.geometry instanceof BufferGeometry) {
      const attributes = node.geometry.attributes;

      // tslint:disable-next-line:forin
      for (const key in attributes) {
        if (key === 'position') {
          delete (attributes[key] as any).array;
        }

        delete attributes[key];
      }

      node.geometry.dispose();
      node.geometry = undefined as any;
    }
  }

  traverse(cb: (node: IPointCloudTreeNodeBase) => void, includeSelf?: boolean): void {
    this.geometryNode.traverse(cb, includeSelf);
  }

  get id() {
    return this.geometryNode.id;
  }

  get name() {
    return this.geometryNode.name;
  }

  get level(): number {
    return this.geometryNode.level;
  }

  get isLeafNode(): boolean {
    return this.geometryNode.isLeafNode;
  }

  get numPoints(): number {
    return this.geometryNode.numPoints;
  }

  get index() {
    return this.geometryNode.index;
  }

  get boundingSphere(): Sphere {
    return this.geometryNode.boundingSphere;
  }

  get boundingBox(): Box3 {
    return this.geometryNode.boundingBox;
  }

  get spacing() {
    return this.geometryNode.spacing;
  }
}
