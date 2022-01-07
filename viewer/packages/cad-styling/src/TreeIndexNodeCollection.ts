/*!
 * Copyright 2022 Cognite AS
 */
import { NumericRange, IndexSet } from '@reveal/utilities';
import { NodeCollectionBase, SerializedNodeCollection } from './NodeCollectionBase';

/**
 * Node collection that holds a set of nodes defined by a set of tree indices.
 */
export class TreeIndexNodeCollection extends NodeCollectionBase {
  public static readonly classToken = 'TreeIndexNodeCollection';

  private _treeIndices: IndexSet;

  constructor(treeIndexSet?: IndexSet);
  constructor(treeIndices?: Iterable<number>);
  constructor(treeIndexRange?: NumericRange);
  constructor(values?: IndexSet | Iterable<number> | NumericRange) {
    super(TreeIndexNodeCollection.classToken);
    if (values instanceof IndexSet) {
      this._treeIndices = values;
    } else if (NumericRange.isNumericRange(values)) {
      this._treeIndices = new IndexSet(values);
    } else {
      this._treeIndices = new IndexSet(values);
    }
  }

  updateSet(treeIndices: IndexSet): void {
    this._treeIndices = treeIndices;
    this.notifyChanged();
  }

  /**
   * Sets this set to hold an empty set.
   */
  clear(): void {
    this._treeIndices = new IndexSet();
    this.notifyChanged();
  }

  getIndexSet(): IndexSet {
    return this._treeIndices;
  }

  get isLoading(): boolean {
    return false;
  }

  serialize(): SerializedNodeCollection {
    return {
      token: this.classToken,
      state: this._treeIndices.toRangeArray()
    };
  }
}
