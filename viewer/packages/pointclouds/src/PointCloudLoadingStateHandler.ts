/*!
 * Copyright 2021 Cognite AS
 */

import type { LoadingState } from '@reveal/model-base';

import type { Observable } from 'rxjs';
import { combineLatest, interval, of, pipe, Subject } from 'rxjs';
import { delay, distinctUntilChanged, map, share, startWith, switchMap } from 'rxjs/operators';
import type { BufferGeometry, Object3D } from 'three';
import { Points } from 'three';

import type { PointCloudNode } from './PointCloudNode';
import { numPointCloudNodesLoading } from './potree-three-loader';
import type { DataSourceType } from '@reveal/data-providers';

/**
 * Wrapper around Potree.Group with type information and
 * basic functionality.
 */
export class PointCloudLoadingStateHandler {
  private _lastDrawPointBuffersHash = 0;
  // Cache of getPointBuffersHash(), refreshed only when the (throttled) Potree
  // visibility/loading update actually runs - see refreshPointBuffersHash().
  // This lets needsRedraw() do an O(1) comparison instead of a full octree
  // traversal on every single animation frame.
  private _currentPointBuffersHash = 0;
  private readonly _forceLoadingSubject = new Subject<void>();
  private readonly _loadingObservable: Observable<LoadingState>;

  private _numNodesLoadingAfterLastRedraw = 0;
  private _numModels = 0;

  /**
   * @param pollLoadingStatusInterval Controls how often the wrapper checks for loading status. Used for testing.
   */
  constructor(pollLoadingStatusInterval: number = 200) {
    this._loadingObservable = this.createLoadingStateObservable(pollLoadingStatusInterval);
    this._lastDrawPointBuffersHash = this.getPointBuffersHash([]);
    this._currentPointBuffersHash = this._lastDrawPointBuffersHash;
  }

  needsRedraw(_pointCloudNodes: PointCloudNode[]): boolean {
    return (
      this._lastDrawPointBuffersHash !== this._currentPointBuffersHash ||
      numPointCloudNodesLoading !== this._numNodesLoadingAfterLastRedraw
    );
  }

  /**
   * Recomputes the point-buffers hash used by needsRedraw(). The visible node set for a
   * point cloud octree only changes as a result of Potree's own visibility/LOD update, so
   * this only needs to be called after that update runs (i.e. from the same throttled path
   * that calls Potree.updatePointClouds()) rather than on every rendered frame.
   */
  refreshPointBuffersHash(pointCloudNodes: PointCloudNode<DataSourceType>[]): void {
    this._currentPointBuffersHash = this.getPointBuffersHash(pointCloudNodes);
  }

  getLoadingStateObserver(): Observable<LoadingState> {
    return this._loadingObservable;
  }

  onModelAdded(): void {
    this._numModels++;
    this._forceLoadingSubject.next();
  }

  onModelRemoved(): void {
    this._numModels--;
  }

  resetFrameStats(): void {
    this._numNodesLoadingAfterLastRedraw = numPointCloudNodesLoading;
  }

  private createLoadingStateObservable(pollLoadingStatusInterval: number): Observable<LoadingState> {
    const forceLoading$ = this._forceLoadingSubject.pipe(trueForDuration(pollLoadingStatusInterval * 5));
    return combineLatest([
      interval(pollLoadingStatusInterval).pipe(
        map(() => getLoadingStateFromPotree(this._numModels)),
        distinctUntilChanged((x, y) => {
          return (
            x.isLoading === y.isLoading && x.itemsLoaded === y.itemsLoaded && x.itemsRequested === y.itemsRequested
          );
        })
      ),
      forceLoading$
    ]).pipe(
      map(x => {
        const [loadingState, forceLoading] = x;
        if (forceLoading && !loadingState.isLoading) {
          return { isLoading: true, itemsLoaded: 0, itemsRequested: 1, itemsCulled: 0 };
        }
        return loadingState;
      }),
      startWith({ isLoading: false, itemsLoaded: 0, itemsRequested: 0, itemsCulled: 0 }),
      distinctUntilChanged(),
      share()
    );
  }

  updatePointBuffersHash(pointCloudNodes: PointCloudNode<DataSourceType>[]): void {
    this._lastDrawPointBuffersHash = this.getPointBuffersHash(pointCloudNodes);
  }

  /**
   * Generates a hash for the current loaded points to allow determining if we have
   * loaded data since last redraw.
   */
  private getPointBuffersHash(pointCloudNodes: PointCloudNode<DataSourceType>[]) {
    let pointHash = 0xbaadf00d; // Kind of random bit pattern
    for (const pointCloud of pointCloudNodes) {
      pointCloud.octree.traverseVisible((x: Object3D) => {
        // Note! We pretend everything in the scene graph is Points,
        // but verify that we only visit Points nodes here.
        if (x instanceof Points) {
          const geometry = x.geometry as BufferGeometry;
          pointHash ^= geometry.getAttribute('position').count;
        }
      });
      pointHash ^= pointCloud.octree.id;
    }
    return pointHash;
  }
}

function trueForDuration(milliseconds: number) {
  return pipe(
    switchMap(() => {
      return of(false).pipe(delay(milliseconds), startWith(true));
    }),
    distinctUntilChanged()
  );
}

function getLoadingStateFromPotree(numPointClouds: number): LoadingState {
  const numNodesLoading: number = numPointCloudNodesLoading;
  return {
    isLoading: numNodesLoading > 0,
    itemsLoaded: numPointClouds - numNodesLoading,
    itemsRequested: numPointClouds,
    itemsCulled: 0
  };
}
