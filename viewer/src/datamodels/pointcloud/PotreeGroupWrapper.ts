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
  private _needsRedraw: boolean = true;
  private readonly _forceLoadingSubject = new Subject();
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

  constructor() {
    super();
    this.potreeGroup = new Potree.Group();
    this.potreeGroup.name = 'Potree.Group';
    this.name = 'Potree point cloud wrapper';
    this.add(this.potreeGroup);

    const onAfterRenderTrigger = new THREE.Mesh(new THREE.Geometry());
    onAfterRenderTrigger.name = 'onAfterRender trigger (no geometry)';
    onAfterRenderTrigger.frustumCulled = false;
    onAfterRenderTrigger.onAfterRender = () => this.resetNeedsRedraw();
    this.add(onAfterRenderTrigger);

    this._loadingObservable = this.createLoadingStateObservable();
  }

  getLoadingStateObserver(): Observable<LoadingState> {
    return this._loadingObservable;
  }

  addPointCloud(node: PotreeNodeWrapper): void {
    this.potreeGroup.add(node.octtree);
    this.nodes.push(node);
    this._forceLoadingSubject.next();
  }

  requestRedraw() {
    this._needsRedraw = true;
  }

  private resetNeedsRedraw() {
    this._needsRedraw = false;
    this.numNodesLoadingAfterLastRedraw = Potree.Global.numNodesLoading;
    this.numChildrenAfterLastRedraw = this.potreeGroup.children.length;
    this.nodes.forEach(n => n.resetNeedsRedraw());
  }

  private createLoadingStateObservable(): Observable<LoadingState> {
    const forceLoading$ = this._forceLoadingSubject.pipe(trueForDuration(1000));
    return combineLatest([
      interval(200).pipe(
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
          return { isLoading: true, itemsLoaded: 0, itemsRequested: 1 };
        }
        return loadingState;
      }),
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
    itemsRequested: Potree.Global.numNodesLoading
  };
}
