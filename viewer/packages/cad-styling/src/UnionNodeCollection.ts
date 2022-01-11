/*!
 * Copyright 2021 Cognite AS
 */
import { NodeCollectionBase, SerializedNodeCollection } from './NodeCollectionBase';
import { CombineNodeCollectionBase } from './CombineNodeCollectionBase';

import { IndexSet } from '@reveal/utilities';

/**
 * Node collection that takes the set union of multiple node collections.
 */

export class UnionNodeCollection extends CombineNodeCollectionBase {
  public static readonly classToken = 'UnionNodeCollection';

  constructor(nodeCollections?: NodeCollectionBase[]) {
    super(UnionNodeCollection.classToken, nodeCollections);
  }

  serialize(): SerializedNodeCollection {
    return {
      token: this.classToken,
      state: {
        subCollections: this._nodeCollections.map(set => set.serialize())
      }
    };
  }

  protected createCombinedIndexSet(): IndexSet {
    if (this._nodeCollections.length === 0) {
      return new IndexSet();
    }
    const set = this._nodeCollections[0].getIndexSet().clone();
    for (let i = 1; i < this._nodeCollections.length; ++i) {
      set.unionWith(this._nodeCollections[i].getIndexSet());
    }
    return set;
  }
}
