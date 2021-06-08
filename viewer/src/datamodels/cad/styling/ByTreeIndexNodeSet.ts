/*!
 * Copyright 2021 Cognite AS
 */
import { IndexSet } from '../../../utilities/IndexSet';
import { NodeSet } from './NodeSet';

/**
 * Node set that holds a set of nodes defined by a set of tree indices.
 * @version New in 2.0.0
 */
export class ByTreeIndexNodeSet extends NodeSet {
  private _set: IndexSet;

  constructor(treeIndexSet: IndexSet);
  constructor(treeIndices: Iterable<number>);
  constructor(values: IndexSet | Iterable<number>) {
    super();
    if (values instanceof IndexSet) {
      this._set = values;
    } else {
      this._set = new IndexSet(values);
    }
  }

  updateSet(nodeSet: IndexSet) {
    this._set = nodeSet;
    this.notifyChanged();
  }

  /**
   * Sets this set to hold an empty set.
   */
  clear() {
    this._set = new IndexSet();
    this.notifyChanged();
  }

  getIndexSet(): IndexSet {
    return this._set;
  }

  get isLoading(): boolean {
    return false;
  }
}
