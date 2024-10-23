/*!
 * Copyright 2021 Cognite AS
 */

import { LoadingState } from '@reveal/model-base';

import { combineLatest, interval, Observable, of, pipe, Subject } from 'rxjs';
import { delay, distinctUntilChanged, map, share, startWith, switchMap } from 'rxjs/operators';
import * as THREE from 'three';

import { PointCloudNode } from './PointCloudNode';
import { numPointCloudNodesLoading } from './potree-three-loader';
import { InternalDataSourceType } from '@reveal/data-providers';

/**
 * Wrapper around Potree.Group with type information and
 * basic functionality.
 */
export class PointCloudLoadingStateHandler {
  private _lastDrawPointBuffersHash = 0;
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
  }

  needsRedraw(pointCloudNodes: PointCloudNode[]): boolean {
    return (
      this._lastDrawPointBuffersHash !== this.getPointBuffersHash(pointCloudNodes) ||
      numPointCloudNodesLoading !== this._numNodesLoadingAfterLastRedraw
    );
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

  updatePointBuffersHash(pointCloudNodes: PointCloudNode<InternalDataSourceType>[]): void {
    this._lastDrawPointBuffersHash = this.getPointBuffersHash(pointCloudNodes);
  }

  /**
   * Generates a hash for the current loaded points to allow determining if we have
   * loaded data since last redraw.
   */
  private getPointBuffersHash(pointCloudNodes: PointCloudNode<InternalDataSourceType>[]) {
    let pointHash = 0xbaadf00d; // Kind of random bit pattern
    for (const pointCloud of pointCloudNodes) {
      pointCloud.octree.traverseVisible((x: THREE.Object3D) => {
        // Note! We pretend everything in the scene graph is THREE.Points,
        // but verify that we only visit Points nodes here.
        if (x instanceof THREE.Points) {
          const geometry = x.geometry as THREE.BufferGeometry;
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
