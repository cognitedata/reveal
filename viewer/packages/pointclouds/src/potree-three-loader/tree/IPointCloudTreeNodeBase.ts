import * as THREE from 'three';

export interface IPointCloudTreeNodeBase {
  id: number;
  name: string;
  level: number;
  index: number;
  spacing: number;
  boundingBox: THREE.Box3;
  boundingSphere: THREE.Sphere;
  loaded: boolean;
  numPoints: number;
  isTreeNode: boolean;

  readonly children: Array<IPointCloudTreeNodeBase | null>;
  readonly isLeafNode: boolean;

  dispose(): void;

  traverse(cb: (node: IPointCloudTreeNodeBase) => void, includeSelf?: boolean): void;
}
