/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { assertNever, EventTrigger, NumericRange } from '@reveal/utilities';

const identityTransform = new THREE.Matrix4().identity();

export type NodeTransformChangedEvent = {
  change: 'set' | 'reset';
  treeIndices: NumericRange;
  transform: THREE.Matrix4;
};

export class NodeTransformProvider {
  private readonly _events = {
    changed: new EventTrigger<NodeTransformChangedEvent>()
  };

  on(event: 'changed', listener: (event: NodeTransformChangedEvent) => void): void {
    switch (event) {
      case 'changed':
        this._events.changed.subscribe(listener);
        break;
      default:
        assertNever(event, `Unsupported event: '${event}'`);
    }
  }

  off(event: 'changed', listener: (event: NodeTransformChangedEvent) => void): void {
    switch (event) {
      case 'changed':
        this._events.changed.unsubscribe(listener);
        break;
      default:
        assertNever(event, `Unsupported event: '${event}'`);
    }
  }

  setNodeTransform(treeIndices: NumericRange, transform: THREE.Matrix4): void {
    this._events.changed.fire({ change: 'set', treeIndices, transform });
  }

  resetNodeTransform(treeIndices: NumericRange): void {
    this._events.changed.fire({ change: 'reset', treeIndices, transform: identityTransform });
  }
}
