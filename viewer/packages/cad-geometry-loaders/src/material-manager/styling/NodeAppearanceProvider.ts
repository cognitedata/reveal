/*!
 * Copyright 2021 Cognite AS
 */

import { NodeAppearance } from '../NodeAppearance';
import { assertNever, EventTrigger } from '@reveal/utilities';
import { IndexSet } from '../../utilities/IndexSet';
import { NodeCollectionBase } from './NodeCollectionBase';

/**
 * Delegate for applying styles in {@see NodeStyleProvider}.
 * @param treeIndices Set of tree indices that the style is applied to.
 * @param appearance  Style to be applied to the nodes.
 */
export type ApplyStyleDelegate = (treeIndices: IndexSet, appearance: NodeAppearance) => void;

type StyledNodeCollection = {
  nodeCollection: NodeCollectionBase;
  appearance: NodeAppearance;
  handleNodeCollectionChangedListener: () => void;
};

export class NodeAppearanceProvider {
  private readonly _styledCollections = new Array<StyledNodeCollection>();
  private _lastFiredLoadingState?: boolean;

  private readonly _events = {
    changed: new EventTrigger<() => void>(),
    loadingStateChanged: new EventTrigger<(isLoading: boolean) => void>()
  };

  on(event: 'changed', listener: () => void): void;
  on(event: 'loadingStateChanged', listener: (isLoading: boolean) => void): void;
  on(event: 'changed' | 'loadingStateChanged', listener: (() => void) | ((isLoading: boolean) => void)): void {
    switch (event) {
      case 'changed':
        this._events.changed.subscribe(listener as () => void);
        break;
      case 'loadingStateChanged':
        this._events.loadingStateChanged.subscribe(listener as (isLoading: boolean) => void);
        break;

      default:
        assertNever(event, `Unsupported event: '${event}'`);
    }
  }

  off(event: 'changed', listener: () => void): void;
  off(event: 'loadingStateChanged', listener: (isLoading: boolean) => void): void;
  off(event: 'changed' | 'loadingStateChanged', listener: (() => void) | ((isLoading: boolean) => void)): void {
    switch (event) {
      case 'changed':
        this._events.changed.unsubscribe(listener as () => void);
        break;
      case 'loadingStateChanged':
        this._events.loadingStateChanged.unsubscribe(listener as (isLoading: boolean) => void);
        break;

      default:
        assertNever(event, `Unsupported event: '${event}'`);
    }
  }

  assignStyledNodeCollection(nodeCollection: NodeCollectionBase, appearance: NodeAppearance) {
    const existingCollection = this._styledCollections.find(x => x.nodeCollection === nodeCollection);
    if (existingCollection !== undefined) {
      existingCollection.appearance = appearance;
      this.handleNodeCollectionChanged(existingCollection);
    } else {
      const styledCollection: StyledNodeCollection = {
        nodeCollection: nodeCollection,
        appearance,
        handleNodeCollectionChangedListener: () => {
          this.handleNodeCollectionChanged(styledCollection);
        }
      };

      this._styledCollections.push(styledCollection);
      nodeCollection.on('changed', styledCollection.handleNodeCollectionChangedListener);
      this.notifyChanged();
    }
  }

  unassignStyledNodeCollection(nodeCollection: NodeCollectionBase) {
    const index = this._styledCollections.findIndex(x => x.nodeCollection === nodeCollection);
    if (index === -1) {
      throw new Error('NodeCollection not added');
    }
    const styledCollection = this._styledCollections[index];

    this._styledCollections.splice(index, 1);
    nodeCollection.off('changed', styledCollection.handleNodeCollectionChangedListener);
    this.notifyChanged();
  }

  applyStyles(applyCb: ApplyStyleDelegate) {
    this._styledCollections.forEach(styledSet => {
      const set = styledSet.nodeCollection.getIndexSet();
      applyCb(set, styledSet.appearance);
    });
  }

  clear() {
    for (const styledSet of this._styledCollections) {
      const nodeCollection = styledSet.nodeCollection;
      nodeCollection.off('changed', styledSet.handleNodeCollectionChangedListener);
    }
    this._styledCollections.splice(0);
    this.notifyChanged();
  }

  get isLoading(): boolean {
    return this._styledCollections.some(x => x.nodeCollection.isLoading);
  }

  private notifyChanged() {
    this._events.changed.fire();
  }

  private notifyLoadingStateChanged() {
    if (this._lastFiredLoadingState === this.isLoading) return;
    this._lastFiredLoadingState = this.isLoading;
    this._events.loadingStateChanged.fire(this.isLoading);
  }

  private handleNodeCollectionChanged(_styledSet: StyledNodeCollection) {
    this.notifyChanged();
    this.notifyLoadingStateChanged();
  }
}
