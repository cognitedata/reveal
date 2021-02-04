/*!
 * Copyright 2021 Cognite AS
 */
import { IndexSet } from './IndexSet';
import { NodeSet } from './NodeSet';

export class FixedNodeSet extends NodeSet {
  private _set: IndexSet;

  constructor(set: IndexSet) {
    super();
    this._set = set;
  }

  updateSet(nodeSet: IndexSet) {
    this._set = nodeSet;
    this.notifyChanged();
  }

  getIndexSet(): IndexSet {
    return this._set;
  }
}
