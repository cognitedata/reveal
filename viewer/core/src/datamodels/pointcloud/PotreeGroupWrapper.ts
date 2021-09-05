/*!
 * Copyright 2021 Cognite AS
 */

import * as Potree from '@cognite/potree-core';

import { combineLatest, interval, Observable, of, pipe, Subject } from 'rxjs';
import { delay, distinctUntilChanged, map, share, startWith, switchMap } from 'rxjs/operators';
import * as THREE from 'three';
import { LoadingState } from '../../utilities';

import { PotreeNodeWrapper } from './PotreeNodeWrapper';

/**
 * Wrapper around Potree.Group with type information and
 * basic functionality.
 */
export class PotreeGroupWrapper extends THREE.Object3D {
  private _needsRedraw: boolean = false;
  private readonly _forceLoadingSubject = new Subject<void>();
  private readonly _loadingObservable: Observable<LoadingState>;

  get needsRedraw(): boolean {
    return (
      this._needsRedraw ||
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
    };
    this.add(onAfterRenderTrigger);

    this._loadingObservable = this.createLoadingStateObservable(pollLoadingStatusInterval);
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

  requestRedraw() {
    this._needsRedraw = true;
  }

  resetRedraw() {
    this._needsRedraw = false;
    this.numNodesLoadingAfterLastRedraw = Potree.Global.numNodesLoading;
    this.numChildrenAfterLastRedraw = this.potreeGroup.children.length;
    this.nodes.forEach(n => n.resetRedraw());
  }

  private createLoadingStateObservable(pollLoadingStatusInterval: number): Observable<LoadingState> {
    const forceLoading$ = this._forceLoadingSubject.pipe(trueForDuration(pollLoadingStatusInterval * 5));
    return combineLatest([
      interval(pollLoadingStatusInterval).pipe(
        map(getLoadingStateFromPotree),
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
}

function trueForDuration(milliseconds: number) {
  return pipe(
    switchMap(() => {
      return of(false).pipe(delay(milliseconds), startWith(true));
    }),
    distinctUntilChanged()
  );
}

function getLoadingStateFromPotree(): LoadingState {
  return {
    isLoading: Potree.Global.numNodesLoading > 0,
    itemsLoaded: 0,
    itemsRequested: Potree.Global.numNodesLoading,
    itemsCulled: 0
  };
}
