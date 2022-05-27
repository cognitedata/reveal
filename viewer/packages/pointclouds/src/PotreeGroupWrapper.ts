/*!
 * Copyright 2021 Cognite AS
 */

import { LoadingState } from '@reveal/model-base';

import { combineLatest, interval, Observable, of, pipe, Subject } from 'rxjs';
import { delay, distinctUntilChanged, map, share, startWith, switchMap } from 'rxjs/operators';
import * as THREE from 'three';

import { PotreeNodeWrapper } from './PotreeNodeWrapper';
import { Potree, PointCloudOctree, numPointCloudNodesLoading } from './potree-three-loader';

/**
 * Wrapper around Potree.Group with type information and
 * basic functionality.
 */
export class PotreeGroupWrapper extends THREE.Object3D {
  private _needsRedraw: boolean = false;
  private _lastDrawPointBuffersHash = 0;
  private readonly _forceLoadingSubject = new Subject<void>();
  private readonly _loadingObservable: Observable<LoadingState>;
  private readonly _pointClouds: PointCloudOctree[];

  get needsRedraw(): boolean {
    return (
      this._needsRedraw ||
      this._lastDrawPointBuffersHash !== this.pointBuffersHash ||
      numPointCloudNodesLoading !== this.numNodesLoadingAfterLastRedraw ||
      this.numChildrenAfterLastRedraw !== this.potreeGroup.children.length ||
      this.nodes.some(n => n.needsRedraw)
    );
  }

  private readonly nodes: PotreeNodeWrapper[] = [];

  private readonly potreeGroup: THREE.Group;
  private readonly _potreeInstance: Potree;

  private numNodesLoadingAfterLastRedraw = 0;
  private numChildrenAfterLastRedraw = 0;

  /**
   * @param potreeInstance Main instance of the Potree library in this Reveal instance
   * @param pollLoadingStatusInterval Controls how often the wrapper checks for loading status. Used for testing.
   */
  constructor(potreeInstance: Potree, pollLoadingStatusInterval: number = 200) {
    super();
    this.potreeGroup = new THREE.Group();
    this._potreeInstance = potreeInstance;
    this.potreeGroup.name = 'Potree.Group';
    this._pointClouds = [];
    this.name = 'Potree point cloud wrapper';
    this.add(this.potreeGroup);

    const onAfterRenderTrigger = new THREE.Mesh(new THREE.BufferGeometry());
    onAfterRenderTrigger.name = 'onAfterRender trigger (no geometry)';
    onAfterRenderTrigger.frustumCulled = false;
    onAfterRenderTrigger.onAfterRender = () => {
      this.resetRedraw();
      // We only reset this when we actually redraw, not on resetRedraw. This is
      // because there are times when this will onAfterRender is triggered
      // just after buffers are uploaded but not visualized yet.
      this._lastDrawPointBuffersHash = this.pointBuffersHash;
    };
    this.add(onAfterRenderTrigger);

    this._loadingObservable = this.createLoadingStateObservable(pollLoadingStatusInterval);
    this._lastDrawPointBuffersHash = this.pointBuffersHash;

    this.pointBudget = 2_000_000;
  }

  get pointBudget(): number {
    return this._potreeInstance.pointBudget;
  }

  set pointBudget(points: number) {
    this._potreeInstance.pointBudget = points;
  }

  get pointClouds(): PointCloudOctree[] {
    return this._pointClouds;
  }

  get potreeInstance(): Potree {
    return this._potreeInstance;
  }

  getLoadingStateObserver(): Observable<LoadingState> {
    return this._loadingObservable;
  }

  addPointCloud(node: PotreeNodeWrapper): void {
    this.potreeGroup.add(node.octree);
    this.nodes.push(node);

    this._pointClouds.push(node.octree);

    this._forceLoadingSubject.next();
    this.requestRedraw();
  }

  removePointCloud(node: PotreeNodeWrapper): void {
    const index = this.nodes.indexOf(node);
    if (index === -1) {
      throw new Error('Point cloud is not added - cannot remove it');
    }
    this.potreeGroup.remove(node.octree);
    this.nodes.splice(index, 1);
  }

  traversePointClouds(callback: (pointCloud: PointCloudOctree) => void): void {
    for (const pointCloud of this._pointClouds) {
      callback(pointCloud);
    }
  }

  requestRedraw(): void {
    this._needsRedraw = true;
  }

  resetRedraw(): void {
    this._needsRedraw = false;
    this.numNodesLoadingAfterLastRedraw = numPointCloudNodesLoading;
    this.numChildrenAfterLastRedraw = this.potreeGroup.children.length;
    this.nodes.forEach(n => n.resetRedraw());
  }

  private createLoadingStateObservable(pollLoadingStatusInterval: number): Observable<LoadingState> {
    const forceLoading$ = this._forceLoadingSubject.pipe(trueForDuration(pollLoadingStatusInterval * 5));
    return combineLatest([
      interval(pollLoadingStatusInterval).pipe(
        map(() => getLoadingStateFromPotree(this.nodes)),
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

  /**
   * Generates a hash for the current loaded points to allow determining if we have
   * loaded data since last redraw.
   */
  private get pointBuffersHash() {
    let pointHash = 0xbaadf00d; // Kind of random bit pattern
    for (const pointCloud of this._pointClouds) {
      pointCloud.traverseVisible((x: THREE.Object3D) => {
        // Note! We pretend everything in the scene graph is THREE.Points,
        // but verify that we only visit Points nodes here.
        if (x instanceof THREE.Points) {
          const geometry = x.geometry as THREE.BufferGeometry;
          pointHash ^= geometry.getAttribute('position').count;
        }
      });
      pointHash ^= pointCloud.id;
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

function getLoadingStateFromPotree(nodes: PotreeNodeWrapper[]): LoadingState {
  const numNodesLoading: number = numPointCloudNodesLoading;
  return {
    isLoading: numNodesLoading > 0,
    itemsLoaded: nodes.length - numNodesLoading,
    itemsRequested: nodes.length,
    itemsCulled: 0
  };
}
