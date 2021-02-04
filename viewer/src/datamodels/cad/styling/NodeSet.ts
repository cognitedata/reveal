/*!
 * Copyright 2021 Cognite AS
 */

import { EventTrigger } from '../../../utilities/events/EventTrigger';
import { IndexSet } from './IndexSet';

export abstract class NodeSet {
  private readonly _changedEvent = new EventTrigger<() => void>();

  on(_event: 'changed', listener: () => void): void {
    this._changedEvent.subscribe(listener);
  }

  off(_event: 'changed', listener: () => void): void {
    this._changedEvent.unsubscribe(listener);
  }

  abstract getIndexSet(): IndexSet;

  protected notifyChanged() {
    this._changedEvent.fire();
  }
}
