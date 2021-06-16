/*!
 * Copyright 2021 Cognite AS
 */

import assert from 'assert';
import { EventTrigger } from '../../../utilities/events/EventTrigger';
import { IndexSet } from '../../../utilities/IndexSet';

export type SerializedNodeSet = {
  token: string;
  state: any;
  options?: any;
};

/**
 * Abstract class for implementing a set of nodes to be styled.
 */
export abstract class NodeSet {
  private readonly _changedEvent = new EventTrigger<() => void>();
  private readonly _classToken: string;

  protected constructor(classToken: string) {
    this._classToken = classToken;
  }

  public get classToken(): string {
    return this._classToken;
  }

  /**
   * Subscribe a listener to events about the set changing, i.e.
   * when nodes are added or removed to the set.
   */
  on(event: 'changed', listener: () => void): void {
    assert(event === 'changed');
    this._changedEvent.subscribe(listener);
  }

  /**
   * Unsubscribe a listener to events about the set changing, i.e.
   * when nodes are added or removed to the set.
   */
  off(event: 'changed', listener: () => void): void {
    assert(event === 'changed');
    this._changedEvent.unsubscribe(listener);
  }

  /**
   * Returns true when the set currently is running an operation
   * for loading the full set of nodes contained by the set.
   */
  abstract get isLoading(): boolean;
  /**
   * Returns the {@link IndexSet} that holds the tree indices
   * of the nodes contained by the set.
   */
  abstract getIndexSet(): IndexSet;

  /**
   * Clears the set, making it empty.
   */
  abstract clear(): void;

  /**
   * Triggers the changed-event.
   */
  protected notifyChanged() {
    this._changedEvent.fire();
  }

  abstract serialize(): SerializedNodeSet;
}
