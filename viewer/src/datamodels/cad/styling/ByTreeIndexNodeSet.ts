/*!
 * Copyright 2021 Cognite AS
 */
import { NumericRange } from '../../../utilities';
import { IndexSet } from '../../../utilities/IndexSet';
import { NodeSet, SerializedNodeSet } from './NodeSet';

/**
 * Node set that holds a set of nodes defined by a set of tree indices.
 */
export class ByTreeIndexNodeSet extends NodeSet {
  private _set: IndexSet;

  constructor(treeIndexSet?: IndexSet);
  constructor(treeIndices?: Iterable<number>);
  constructor(treeIndexRange?: NumericRange);
  constructor(values?: IndexSet | Iterable<number> | NumericRange) {
    super('ByTreeIndexNodeSet');
    if (values instanceof IndexSet) {
      this._set = values;
    } else if (values instanceof NumericRange) {
      this._set = new IndexSet(values);
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

  /** @internal */
  serialize(): SerializedNodeSet {
    return {
      token: this.classToken,
      state: this._set.toRangeArray()
    };
  }
}
