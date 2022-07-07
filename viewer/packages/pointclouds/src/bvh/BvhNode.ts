/*!
 * Copyright 2022 Cognite AS
 */

import { unionBoxes } from '@reveal/utilities';
import * as THREE from 'three';

import { BvhElement } from './BvhElement';

import { findBestSplit } from './bvhUtils';

import assert from 'assert';

export class BvhNode<T extends BvhElement> {

  // Either _children or _elements is defined. Not both, not none.
  private readonly _children: [BvhNode<T>, BvhNode<T>] | undefined;
  private readonly _elements: T[] | undefined;

  private readonly _boundingBox: THREE.Box3;

  constructor(elements: T[]) {
    if (elements.length < 3) {
      this._elements = elements.slice();
      this._boundingBox = unionBoxes(this._elements.map(e => e.getBox()));

      return;
    }

    const [firstElements, lastElements] = findBestSplit(elements);

    this._children = [new BvhNode<T>(firstElements),
                      new BvhNode<T>(lastElements)];

    this._boundingBox = this._children[0].boundingBox.clone().union(this._children[1].boundingBox);
  }

  get boundingBox(): THREE.Box3 {
    return this._boundingBox;
  }

  findContainingElements(point: THREE.Vector3, resultList: T[]) {
    if (this._elements) {

      for (const element of this._elements) {
        if (element.getBox().containsPoint(point)) {
          resultList.push(element);
        }
      }

      return;
    }

    assert(this._children);

    if (this._children[0].boundingBox.containsPoint(point)) {
      this._children[0].findContainingElements(point, resultList);
    }

    if (this._children[1].boundingBox.containsPoint(point)) {
      this._children[1].findContainingElements(point, resultList);
    }
  }
};
