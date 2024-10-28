/*!
 * Copyright 2022 Cognite AS
 */

import assert from 'assert';

import { EventTrigger } from '@reveal/utilities';

/**
 * Base class for collections of point cloud objects intended for styling operations
 */
export abstract class PointCloudAnnotationVolumeCollection {
  private readonly _changedEvent = new EventTrigger<() => void>();

  /**
   * annotation IDs of the annotations for the objects represented by this PointCloudObjectCollection instance
   */
  abstract getAnnotationIds(): Iterable<number>;

  /**
   * Whether the collection is still loading data in the background i.e. not yet ready for use
   */
  abstract get isLoading(): boolean;

  /**
   * Register an event listener on this collection
   */
  on(event: 'changed', listener: () => void): void {
    assert(event === 'changed');
    this._changedEvent.subscribe(listener);
  }

  /**
   * Unregister an event listener on this collection
   */
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
 * Alias for PointCloudAnnotationVolumeCollection
 * @deprecated Use {@link PointCloudAnnotationVolumeCollection} instead
 */
export abstract class PointCloudObjectCollection extends PointCloudAnnotationVolumeCollection {}
