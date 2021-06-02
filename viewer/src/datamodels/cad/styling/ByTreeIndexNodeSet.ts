/*!
 * Copyright 2021 Cognite AS
 */
import { IndexSet } from '../../../utilities/IndexSet';
import { NodeSet } from './NodeSet';

export class ByTreeIndexNodeSet extends NodeSet {
  private _set: IndexSet;

  constructor(treeIndexSet: IndexSet);
  constructor(treeIndices: Iterable<number>);
  constructor(values: IndexSet | Iterable<number>) {
    super(ByTreeIndexNodeSet.name);
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

  getIndexSet(): IndexSet {
    return this._set;
  }

  get isLoading(): boolean {
    return false;
  }
}
