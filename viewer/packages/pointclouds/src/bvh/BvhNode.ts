/*!
 * Copyright 2022 Cognite AS
 */

import { unionBoxes } from './unionBoxes';
import * as THREE from 'three';

import { BvhElement } from './BvhElement';

import { findBestSplit } from './bvhUtils';

const MAX_ELEMENTS_IN_LEAF = 1;

export class BvhNode<T extends BvhElement> {
  // Either _children or _elements is defined. Not both, not none.
  private readonly _children: [BvhNode<T>, BvhNode<T>] | undefined;
  private readonly _elements: T[] | undefined;

  private readonly _boundingBox: THREE.Box3;

  constructor(elements: T[]) {
    if (elements.length <= MAX_ELEMENTS_IN_LEAF) {
      this._elements = elements.slice();
      this._boundingBox = unionBoxes(this._elements.map(e => e.getBox()));

      return;
    }

    const [firstElements, lastElements] = findBestSplit(elements);

    this._children = [new BvhNode<T>(firstElements), new BvhNode<T>(lastElements)];

    this._boundingBox = this._children[0].boundingBox.clone().union(this._children[1].boundingBox);
  }

  get boundingBox(): THREE.Box3 {
    return this._boundingBox;
  }

  get children(): [BvhNode<T>, BvhNode<T>] | undefined {
    return this._children;
  }

  get elements(): T[] | undefined {
    return this._elements;
  }

  findContainingElements(point: THREE.Vector3, resultList: T[]): void {
    if (this._elements) {
      for (const element of this._elements) {
        if (element.getBox().containsPoint(point)) {
          resultList.push(element);
        }
      }

      return;
    }

    if (this._children![0].boundingBox.containsPoint(point)) {
      this._children![0].findContainingElements(point, resultList);
    }

    if (this._children![1].boundingBox.containsPoint(point)) {
      this._children![1].findContainingElements(point, resultList);
    }
  }

  traverseContainingElements(point: THREE.Vector3, callback: (element: T) => void): void {
    if (this._elements) {
      for (const element of this._elements) {
        if (element.getBox().containsPoint(point)) {
          callback(element);
        }
      }

      return;
    }

    if (this._children![0].boundingBox.containsPoint(point)) {
      this._children![0].traverseContainingElements(point, callback);
    }

    if (this._children![1].boundingBox.containsPoint(point)) {
      this._children![1].traverseContainingElements(point, callback);
    }
  }
}
