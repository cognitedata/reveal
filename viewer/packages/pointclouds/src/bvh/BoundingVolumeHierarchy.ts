/*!
 * Copyright 2022 Cognite AS
 */

import { BvhElement } from './BvhElement';
import { BvhNode } from './BvhNode';

export class BoundingVolumeHierarchy<T extends BvhElement> {
  private readonly _root: BvhNode<T>;

  constructor(elements: T[]) {
    this._root = new BvhNode(elements);
  }

  findContainingElements(point: THREE.Vector3): T[] {
    const resultList = new Array<T>();
    this._root.findContainingElements(point, resultList);
    return resultList;
  }
};
