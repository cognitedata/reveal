/*!
 * Copyright 2021 Cognite AS
 */

import { NodeAppearance } from '..';
import { EventTrigger } from '../../../utilities/events';
import { IndexSet } from '../../../utilities/IndexSet';
import { NodeSet } from './NodeSet';

export type ApplyStyleDelegate = (styleId: number, treeIndices: IndexSet, apperance: NodeAppearance) => void;

export class NodeStyleProvider {
  private _styledSet = new Array<{ styleId: number; nodeSet: NodeSet; appearance: NodeAppearance }>();
  private _handleNodeSetChangedListener: () => void;
  private _changedEvent = new EventTrigger<() => void>();

  constructor() {
    this._handleNodeSetChangedListener = this.handleNodeSetChanged.bind(this);
  }

  on(_event: 'changed', listener: () => void) {
    this._changedEvent.subscribe(listener);
  }

  off(_event: 'changed', listener: () => void) {
    this._changedEvent.unsubscribe(listener);
  }

  addStyledSet(nodeSet: NodeSet, appearance: NodeAppearance) {
    const styleId = this._styledSet.length + 1;
    this._styledSet.push({ styleId, nodeSet, appearance });
    nodeSet.on('changed', this._handleNodeSetChangedListener);
    this.notifyChanged();
  }

  removedStyledSet(nodeSet: NodeSet) {
    const index = this._styledSet.findIndex(x => x.nodeSet === nodeSet);
    if (index === -1) {
      throw new Error('Node set not added');
    }

    this._styledSet.splice(index, 1);
    nodeSet.off('changed', this._handleNodeSetChangedListener);
    this.notifyChanged();
  }

  applyStyles(applyCb: ApplyStyleDelegate) {
    this._styledSet.forEach(x => {
      const set = x.nodeSet.getIndexSet();
      applyCb(x.styleId, set, x.appearance);
    });
  }

  private notifyChanged() {
    this._changedEvent.fire();
  }

  private handleNodeSetChanged() {
    this.notifyChanged();
  }
}
