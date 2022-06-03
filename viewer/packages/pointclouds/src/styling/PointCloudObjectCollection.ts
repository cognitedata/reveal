/*!
 * Copyright 2022 Cognite AS
 */

import assert from 'assert';

import { EventTrigger } from '@reveal/utilities';

export abstract class PointCloudObjectCollection {
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
