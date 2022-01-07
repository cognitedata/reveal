/*!
 * Copyright 2022 Cognite AS
 */
import { NodeCollectionBase, SerializedNodeCollection } from './NodeCollectionBase';
import { UnionNodeCollection } from './UnionNodeCollection';
import { CombineNodeCollectionBase } from './CombineNodeCollectionBase';

import { IndexSet } from '@reveal/utilities';

/**
 * Node collection that is the intersection between a set of underlying node collections.
 */
export class IntersectionNodeCollection extends CombineNodeCollectionBase {
  public static readonly classToken = 'IntersectionNodeCollection';

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
      set.intersectWith(this._nodeCollections[i].getIndexSet());
    }
    return set;
  }
}
