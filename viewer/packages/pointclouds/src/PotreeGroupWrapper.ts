/*!
 * Copyright 2021 Cognite AS
 */

import * as Potree from '@cognite/potree-core';
import { LoadingState } from '@reveal/model-base';

import { combineLatest, interval, Observable, of, pipe, Subject } from 'rxjs';
import { delay, distinctUntilChanged, map, share, startWith, switchMap } from 'rxjs/operators';
import * as THREE from 'three';

import { PotreeNodeWrapper } from './PotreeNodeWrapper';

/**
 * Wrapper around Potree.Group with type information and
 * basic functionality.
 */
export class PotreeGroupWrapper extends THREE.Object3D {
  private _needsRedraw: boolean = false;
  private _lastDrawPointBuffersHash = 0;
  private readonly _forceLoadingSubject = new Subject<void>();
  private readonly _loadingObservable: Observable<LoadingState>;

  get needsRedraw(): boolean {
    return (
      this._needsRedraw ||
      this._lastDrawPointBuffersHash !== this.pointBuffersHash ||
      Potree.Global.numNodesLoading !== this.numNodesLoadingAfterLastRedraw ||
      this.numChildrenAfterLastRedraw !== this.potreeGroup.children.length ||
      this.nodes.some(n => n.needsRedraw)
    );
  }

  private readonly nodes: PotreeNodeWrapper[] = [];
  private readonly potreeGroup: Potree.Group;
  private numNodesLoadingAfterLastRedraw = 0;
  private numChildrenAfterLastRedraw = 0;

  /**
   * @param pollLoadingStatusInterval Controls how often the wrapper checks for loading status. Used for testing.
   */
  constructor(pollLoadingStatusInterval: number = 200) {
    super();
    this.potreeGroup = new Potree.Group();
    this.potreeGroup.name = 'Potree.Group';
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
    return this.potreeGroup.pointBudget;
  }

  set pointBudget(points: number) {
    this.potreeGroup.pointBudget = points;
  }

  getLoadingStateObserver(): Observable<LoadingState> {
    return this._loadingObservable;
  }

  addPointCloud(node: PotreeNodeWrapper): void {
    this.potreeGroup.add(node.octtree);
    this.nodes.push(node);
    this._forceLoadingSubject.next();
    this.requestRedraw();
  }

  removePointCloud(node: PotreeNodeWrapper): void {
    const index = this.nodes.indexOf(node);
    if (index === -1) {
      throw new Error('Point cloud is not added - cannot remove it');
    }
    this.potreeGroup.remove(node.octtree);
    this.nodes.splice(index, 1);
  }

  requestRedraw(): void {
    this._needsRedraw = true;
  }

  resetRedraw(): void {
    this._needsRedraw = false;
    this.numNodesLoadingAfterLastRedraw = Potree.Global.numNodesLoading;
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
    const pointClouds = this.potreeGroup.pointclouds;
    let pointHash = 0xbaadf00d; // Kind of random bit pattern
    for (const pointCloud of pointClouds) {
      pointCloud.traverseVisible((x: THREE.Points) => {
        // Note! We pretend everything in the scene graph is THREE.Points,
        // but verify that we only visit Points nodes here.
        if (x.isPoints) {
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
  const numNodesLoading: number = Potree.Global.numNodesLoading;
  return {
    isLoading: numNodesLoading > 0,
    itemsLoaded: nodes.length - numNodesLoading,
    itemsRequested: nodes.length,
    itemsCulled: 0
  };
}
