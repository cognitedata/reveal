/*!
 * Copyright 2021 Cognite AS
 */

import { NodeAppearance } from './NodeAppearance';
import { NodeCollection } from './NodeCollection';
import { PrioritizedArea } from './prioritized/types';

import { IndexSet, assertNever, EventTrigger } from '@reveal/utilities';

import debounce from 'lodash/debounce';
import sortBy from 'lodash/sortBy';

/**
 * Delegate for applying styles in {@see NodeStyleProvider}.
 * @param treeIndices Set of tree indices that the style is applied to.
 * @param appearance  Style to be applied to the nodes.
 */
export type ApplyStyleDelegate = (treeIndices: IndexSet, appearance: NodeAppearance) => void;

type StyledNodeCollection = {
  nodeCollection: NodeCollection;
  appearance: NodeAppearance;
  importance: number;
  handleNodeCollectionChangedListener: () => void;
};

export class NodeAppearanceProvider {
  private _styledCollections = new Array<StyledNodeCollection>();
  private _lastFiredLoadingState?: boolean;
  private _cachedPrioritizedAreas?: PrioritizedArea[] = undefined;

  private readonly _events = {
    changed: new EventTrigger<() => void>(),
    loadingStateChanged: new EventTrigger<(isLoading: boolean) => void>(),
    prioritizedAreasChanged: new EventTrigger<() => void>()
  };

  on(event: 'changed', listener: () => void): void;
  on(event: 'loadingStateChanged', listener: (isLoading: boolean) => void): void;
  on(event: 'prioritizedAreasChanged', listener: () => void): void;
  on(
    event: 'changed' | 'loadingStateChanged' | 'prioritizedAreasChanged',
    listener: (() => void) | ((isLoading: boolean) => void)
  ): void {
    switch (event) {
      case 'changed':
        this._events.changed.subscribe(listener as () => void);
        break;
      case 'loadingStateChanged':
        this._events.loadingStateChanged.subscribe(listener as (isLoading: boolean) => void);
        break;
      case 'prioritizedAreasChanged':
        this._events.prioritizedAreasChanged.subscribe(listener as () => void);
        break;

      default:
        assertNever(event, `Unsupported event: '${event}'`);
    }
  }

  off(event: 'changed', listener: () => void): void;
  off(event: 'loadingStateChanged', listener: (isLoading: boolean) => void): void;
  off(
    event: 'changed' | 'loadingStateChanged' | 'prioritizedAreasChanged',
    listener: (() => void) | ((isLoading: boolean) => void)
  ): void {
    switch (event) {
      case 'changed':
        this._events.changed.unsubscribe(listener as () => void);
        break;
      case 'loadingStateChanged':
        this._events.loadingStateChanged.unsubscribe(listener as (isLoading: boolean) => void);
        break;
      case 'prioritizedAreasChanged':
        this._events.prioritizedAreasChanged.unsubscribe(listener as () => void);
        break;

      default:
        assertNever(event, `Unsupported event: '${event}'`);
    }
  }

  assignStyledNodeCollection(nodeCollection: NodeCollection, appearance: NodeAppearance, importance: number = 0): void {
    const existingCollection = this._styledCollections.find(x => x.nodeCollection === nodeCollection);
    if (existingCollection !== undefined) {
      existingCollection.appearance = appearance;
      existingCollection.importance = importance;

      this.handleNodeCollectionChanged(existingCollection);
    } else {
      const styledCollection: StyledNodeCollection = {
        nodeCollection: nodeCollection,
        appearance,
        importance,
        handleNodeCollectionChangedListener: () => {
          this.handleNodeCollectionChanged(styledCollection);
        }
      };

      this._styledCollections.push(styledCollection);
      nodeCollection.on('changed', styledCollection.handleNodeCollectionChangedListener);
      this.scheduleNotifyChanged();
    }

    // Sort ascending, to set the most important styles last so they override the unimportant
    this._styledCollections = sortBy(this._styledCollections, sc => sc.importance); // Using lodash sortBy as array.sort is not stable

    if (appearance.prioritizedForLoadingHint) {
      this.notifyPrioritizedAreasChanged();
    }
  }

  unassignStyledNodeCollection(nodeCollection: NodeCollection): void {
    const index = this._styledCollections.findIndex(x => x.nodeCollection === nodeCollection);
    if (index === -1) {
      throw new Error('NodeCollection not added');
    }
    const styledCollection = this._styledCollections[index];

    this._styledCollections.splice(index, 1);
    nodeCollection.off('changed', styledCollection.handleNodeCollectionChangedListener);
    this.scheduleNotifyChanged();
  }

  applyStyles(applyCb: ApplyStyleDelegate): void {
    this._styledCollections.forEach(styledSet => {
      const set = styledSet.nodeCollection.getIndexSet();
      applyCb(set, styledSet.appearance);
    });
  }

  getPrioritizedAreas(): PrioritizedArea[] {
    if (this._cachedPrioritizedAreas) {
      return this._cachedPrioritizedAreas;
    }

    const prioritizedCollections = this._styledCollections.filter(
      collection => collection.appearance.prioritizedForLoadingHint
    );

    const prioritizedAreas = prioritizedCollections.flatMap(collection => {
      const prioritizedAreaList: PrioritizedArea[] = [];
      for (const area of collection.nodeCollection.getAreas().areas()) {
        prioritizedAreaList.push({ area, extraPriority: collection.appearance.prioritizedForLoadingHint! });
      }
      return prioritizedAreaList;
    });

    this._cachedPrioritizedAreas = prioritizedAreas;
    return this._cachedPrioritizedAreas;
  }

  clear(): void {
    for (const styledSet of this._styledCollections) {
      const nodeCollection = styledSet.nodeCollection;
      nodeCollection.off('changed', styledSet.handleNodeCollectionChangedListener);
    }
    this._styledCollections.splice(0);
    this.scheduleNotifyChanged();
  }

  get isLoading(): boolean {
    return this._styledCollections.some(x => x.nodeCollection.isLoading);
  }

  dispose(): void {
    this.scheduleNotifyChanged.cancel();
    this._events.changed.unsubscribeAll();
    this._events.loadingStateChanged.unsubscribeAll();
    this._events.prioritizedAreasChanged.unsubscribeAll();
  }

  private notifyChanged() {
    this._cachedPrioritizedAreas = undefined;
    this._events.changed.fire();
  }

  /**
   * Schedules event 'changed' to trigger at the next tick.
   */
  private readonly scheduleNotifyChanged = debounce(() => this.notifyChanged(), 0);

  private notifyLoadingStateChanged() {
    if (this._lastFiredLoadingState === this.isLoading) return;
    this._lastFiredLoadingState = this.isLoading;
    this._events.loadingStateChanged.fire(this.isLoading);
  }

  private handleNodeCollectionChanged(_styledSet: StyledNodeCollection) {
    this.scheduleNotifyChanged();
    this.notifyLoadingStateChanged();
  }

  private notifyPrioritizedAreasChanged() {
    this._events.prioritizedAreasChanged.fire();
  }
}
