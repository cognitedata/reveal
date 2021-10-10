/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { assertNever, EventTrigger, NumericRange } from '@reveal/utilities';

const identityTransform = new THREE.Matrix4().identity();

export type NodeTransformChangeEventDelegate = (
  change: 'set' | 'reset',
  treeIndices: NumericRange,
  transform: THREE.Matrix4
) => void;

export class NodeTransformProvider {
  private readonly _events = {
    changed: new EventTrigger<NodeTransformChangeEventDelegate>()
  };

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

  setNodeTransform(treeIndices: NumericRange, transform: THREE.Matrix4) {
    this._events.changed.fire('set', treeIndices, transform);
  }

  resetNodeTransform(treeIndices: NumericRange) {
    this._events.changed.fire('reset', treeIndices, identityTransform);
  }
}
