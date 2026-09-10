import type { Box3, Sphere } from 'three';

export interface IPointCloudTreeNodeBase {
  id: number;
  name: string;
  level: number;
  index: number;
  spacing: number;
  boundingBox: Box3;
  boundingSphere: Sphere;
  loaded: boolean;
  numPoints: number;
  isTreeNode: boolean;

  readonly children: Array<IPointCloudTreeNodeBase | null>;
  readonly isLeafNode: boolean;

  dispose(): void;

  traverse(cb: (node: IPointCloudTreeNodeBase) => void, includeSelf?: boolean): void;
}
