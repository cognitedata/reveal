/*!
 * Copyright 2022 Cognite AS
 */

import assert from 'assert';

import { EventTrigger } from '@reveal/utilities';

/**
 * Base class for collections of point cloud objects intended for styling operations
 */
export abstract class StylableObjectCollection {
  private readonly _changedEvent = new EventTrigger<() => void>();

  abstract getAnnotationIds(): Iterable<number>;

  abstract get isLoading(): boolean;

  on(event: 'changed', listener: () => void): void {
    assert(event === 'changed');
    this._changedEvent.subscribe(listener);
  }

  off(event: 'changed', listener: () => void): void {
    assert(event === 'changed');
    this._changedEvent.unsubscribe(listener);
  }
}
