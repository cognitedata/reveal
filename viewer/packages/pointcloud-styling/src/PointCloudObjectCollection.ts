/*!
 * Copyright 2022 Cognite AS
 */

import assert from 'assert';

import { EventTrigger } from '@reveal/utilities';

/**
 * Base class for collections of point cloud objects intended for styling operations
 * @deprecated Use {@link PointCloudAnnotationVolumeCollection} instead
 */
export abstract class PointCloudObjectCollection {
  private readonly _changedEvent = new EventTrigger<() => void>();

  /**
   * @returns annotation IDs of the annotations for the objects represented by this PointCloudObjectCollection instance
   */
  abstract getAnnotationIds(): Iterable<number>;

  /**
   * @returns whether the collection is still loading data in the background i.e. not yet ready for use
   */
  abstract get isLoading(): boolean;

  on(event: 'changed', listener: () => void): void {
    assert(event === 'changed');
    this._changedEvent.subscribe(listener);
  }

  off(event: 'changed', listener: () => void): void {
    assert(event === 'changed');
    this._changedEvent.unsubscribe(listener);
  }

  /**
   * Triggers the changed-event.
   */
  protected notifyChanged(): void {
    this._changedEvent.fire();
  }
}

/**
 * Alias for PointCloudObjectCollection
 */
export abstract class PointCloudAnnotationVolumeCollection extends PointCloudObjectCollection {}
