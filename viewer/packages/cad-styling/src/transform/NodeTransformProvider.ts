/*!
 * Copyright 2021 Cognite AS
 */

import { assertNever, EventTrigger, NumericRange } from '@reveal/utilities';
import { cadFromCdfToThreeMatrix, cadFromThreeToCdfMatrix } from '@reveal/utilities/src/constants';
import { Matrix4 } from 'three';

const identityTransform = new Matrix4().identity();

type SerializedIndexSet = `${number}-${number}`;

export type NodeTransformChangeEventDelegate = (
  change: 'set' | 'reset',
  treeIndices: NumericRange,
  transform: Matrix4
) => void;

export class NodeTransformProvider {
  private readonly _events = {
    changed: new EventTrigger<NodeTransformChangeEventDelegate>()
  };

  private readonly _treeIndexSetToWorldTransformMap: Map<SerializedIndexSet, [NumericRange, Matrix4]>;

  private _cdfToWorldTransform: Matrix4;
  private _worldToCdfTransform: Matrix4;

  constructor() {
    this._cdfToWorldTransform = cadFromCdfToThreeMatrix.clone();
    this._worldToCdfTransform = cadFromCdfToThreeMatrix.clone().invert();
    this._treeIndexSetToWorldTransformMap = new Map();
  }

  on(event: 'changed', listener: NodeTransformChangeEventDelegate): void {
    switch (event) {
      case 'changed':
        this._events.changed.subscribe(listener as NodeTransformChangeEventDelegate);
        break;
      default:
        assertNever(event, `Unsupported event: '${event}'`);
    }
  }

  off(event: 'changed', listener: NodeTransformChangeEventDelegate): void {
    switch (event) {
      case 'changed':
        this._events.changed.unsubscribe(listener as NodeTransformChangeEventDelegate);
        break;
      default:
        assertNever(event, `Unsupported event: '${event}'`);
    }
  }

  setCdfToWorldTransform(cdfToModelTransformation: Matrix4): void {
    this._cdfToWorldTransform = cdfToModelTransformation.clone();
    this._worldToCdfTransform = cdfToModelTransformation.clone().invert();

    this._treeIndexSetToWorldTransformMap.forEach(([range, transform]) => {
      this.setNodeTransform(range, transform, 'world');
    });
  }

  setNodeTransform(treeIndices: NumericRange, transform: Matrix4, space: 'model' | 'world' = 'world'): void {
    if (space === 'model') {
      const localTransform = transform.clone().multiply(cadFromCdfToThreeMatrix).premultiply(cadFromThreeToCdfMatrix);
      this._events.changed.fire('set', treeIndices, localTransform);
      return;
    }

    const indexSetKey: SerializedIndexSet = `${treeIndices.from}-${treeIndices.toInclusive}`;
    this._treeIndexSetToWorldTransformMap.set(indexSetKey, [treeIndices, transform]);
    const worldTransform = transform.clone().multiply(this._cdfToWorldTransform).premultiply(this._worldToCdfTransform);
    this._events.changed.fire('set', treeIndices, worldTransform);
  }

  resetNodeTransform(treeIndices: NumericRange): void {
    this._events.changed.fire('reset', treeIndices, identityTransform);
  }
}
