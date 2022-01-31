/*!
 * Copyright 2021 Cognite AS
 */

import assert from 'assert';
import { AreaCollection } from './prioritized/AreaCollection';
import { SerializedNodeCollection } from './SerializedNodeCollection';
import { EventTrigger, IndexSet } from '@reveal/utilities';

/**
 * Abstract class for implementing a set of nodes to be styled.
 */
export abstract class NodeCollection {
  private readonly _changedEvent = new EventTrigger<() => void>();
  private readonly _classToken: string;

  protected constructor(classToken: string) {
    this._classToken = classToken;
  }

  public get classToken(): string {
    return this._classToken;
  }

  on(event: 'changed', listener: () => void): void {
    assert(event === 'changed');
    this._changedEvent.subscribe(listener);
  }

  off(event: 'changed', listener: () => void): void {
    assert(event === 'changed');
    this._changedEvent.unsubscribe(listener);
  }

  abstract get isLoading(): boolean;
  abstract getIndexSet(): IndexSet;
  abstract getAreas(): AreaCollection;
  abstract clear(): void;
  abstract serialize(): SerializedNodeCollection;

  /**
   * Triggers the changed-event.
   */
  protected notifyChanged(): void {
    this._changedEvent.fire();
  }
}
