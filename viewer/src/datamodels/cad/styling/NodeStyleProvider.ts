/*!
 * Copyright 2021 Cognite AS
 */

import { NodeAppearance } from '..';
import { EventTrigger } from '../../../utilities/events';
import { IndexSet } from '../../../utilities/IndexSet';
import { NodeSet } from './NodeSet';

/**
 * Delegate for applying styles in {@see NodeStyleProvider}.
 * @param styleId     Unique identifier of style being applied to distinguish/identify sets
 *                    between multiple calls.
 * @param revision    Running number that is incremented whenever the styled set changes.
 *                    Can be used to identify if a set has been changed.
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

export class NodeStyleProvider {
  private _styledSet = new Array<StyledSet>();
  private _changedEvent = new EventTrigger<() => void>();

  on(_event: 'changed', listener: () => void) {
    this._changedEvent.subscribe(listener);
  }

  off(_event: 'changed', listener: () => void) {
    this._changedEvent.unsubscribe(listener);
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

  removedStyledSet(nodeSet: NodeSet) {
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

  private notifyChanged() {
    this._changedEvent.fire();
  }

  private handleNodeSetChanged(styledSet: StyledSet) {
    styledSet.revision++;
    this.notifyChanged();
  }
}
