/*!
 * Copyright 2021 Cognite AS
 */

import assert from 'assert';
import { EventTrigger } from '../../../utilities/events/EventTrigger';
import { IndexSet } from '../../../utilities/IndexSet';

export abstract class NodeSet {
  private readonly _changedEvent = new EventTrigger<() => void>();
  private readonly _classToken: string;

  protected constructor(classToken: string) {
    this._classToken = classToken;
  }

  public get classToken(): string {
    return this._classToken;
  }

  on(_event: 'changed', listener: () => void): void {
    assert(_event === 'changed');
    this._changedEvent.subscribe(listener);
  }

  off(_event: 'changed', listener: () => void): void {
    assert(_event === 'changed');
    this._changedEvent.unsubscribe(listener);
  }

  abstract get isLoading(): boolean;
  abstract getIndexSet(): IndexSet;

  protected notifyChanged() {
    this._changedEvent.fire();
  }
}
