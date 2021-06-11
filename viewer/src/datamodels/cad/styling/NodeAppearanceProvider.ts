/*!
 * Copyright 2021 Cognite AS
 */

import { NodeAppearance } from '..';
import { assertNever } from '../../../utilities';
import { EventTrigger } from '../../../utilities/events';
import { IndexSet } from '../../../utilities/IndexSet';
import { NodeSet } from './NodeSet';

/**
 * Delegate for applying styles in {@see NodeStyleProvider}.
 * @param styleId     Unique identifier of style being applied to distinguish/identify sets
 * between multiple calls.
 * @param revision    Running number that is incremented whenever the styled set changes.
 * Can be used to identify if a set has been changed.
 * @param treeIndices Set of tree indices that the style is applied to.
 * @param appearance  Style to be applied to the nodes.
 */
export type ApplyStyleDelegate = (
  styleId: number,
  revision: number,
  treeIndices: IndexSet,
  appearance: NodeAppearance
) => void;

type StyledSet = {
  styleId: number;
  revision: number;
  nodeSet: NodeSet;
  appearance: NodeAppearance;
  handleNodeSetChangedListener: () => void;
};

export class NodeAppearanceProvider {
  private readonly _styledSet = new Array<StyledSet>();
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

  addStyledSet(nodeSet: NodeSet, appearance: NodeAppearance) {
    const styledSet: StyledSet = {
      styleId: this._styledSet.length + 1,
      revision: 0,
      nodeSet,
      appearance,
      handleNodeSetChangedListener: () => {
        this.handleNodeSetChanged(styledSet);
      }
    };

    this._styledSet.push(styledSet);
    nodeSet.on('changed', styledSet.handleNodeSetChangedListener);
    this.notifyChanged();
  }

  changeStyledSetAppearance(nodeSet: NodeSet, appearance: NodeAppearance) {
    const styledSet = this._styledSet.find(x => x.nodeSet === nodeSet);
    if (!styledSet) {
      throw new Error('Node set not added');
    }
    styledSet.appearance = appearance;

    this.handleNodeSetChanged(styledSet);
  }

  removeStyledSet(nodeSet: NodeSet) {
    const index = this._styledSet.findIndex(x => x.nodeSet === nodeSet);
    if (index === -1) {
      throw new Error('Node set not added');
    }
    const styledSet = this._styledSet[index];

    this._styledSet.splice(index, 1);
    nodeSet.off('changed', styledSet.handleNodeSetChangedListener);
    this.notifyChanged();
  }

  applyStyles(applyCb: ApplyStyleDelegate) {
    this._styledSet.forEach(styledSet => {
      const set = styledSet.nodeSet.getIndexSet();
      applyCb(styledSet.styleId, styledSet.revision, set, styledSet.appearance);
    });
  }

  clear() {
    for (const styledSet of this._styledSet) {
      const nodeSet = styledSet.nodeSet;
      nodeSet.off('changed', styledSet.handleNodeSetChangedListener);
    }
    this._styledSet.splice(0);
    this.notifyChanged();
  }

  get isLoading(): boolean {
    return this._styledSet.some(x => x.nodeSet.isLoading);
  }

  private notifyChanged() {
    this._events.changed.fire();
  }

  private notifyLoadingStateChanged() {
    if (this._lastFiredLoadingState === this.isLoading) return;
    this._lastFiredLoadingState = this.isLoading;
    this._events.loadingStateChanged.fire(this.isLoading);
  }

  private handleNodeSetChanged(styledSet: StyledSet) {
    styledSet.revision++;
    this.notifyChanged();
    this.notifyLoadingStateChanged();
  }
}
