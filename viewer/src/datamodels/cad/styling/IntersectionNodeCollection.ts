/*!
 * Copyright 2021 Cognite AS
 */
import { IndexSet } from '../../../utilities/IndexSet';
import { NodeCollectionBase, SerializedNodeCollection } from './NodeCollectionBase';
import { UnionNodeCollection } from './UnionNodeCollection';
import { CombineNodeCollectionBase } from './CombineNodeCollectionBase';

/**
 * Node collection that is the intersection between a set of underlying node collections.
 */

export class IntersectionNodeCollection extends CombineNodeCollectionBase {
  public static readonly classToken = 'IntersectionNodeCollection';

  constructor(nodeCollections?: NodeCollectionBase[]) {
    super(UnionNodeCollection.classToken, nodeCollections);
  }

  /** @internal */
  serialize(): SerializedNodeCollection {
    return {
      token: this.classToken,
      state: {
        subCollections: this._nodeCollections.map(set => set.serialize())
      }
    };
  }

  protected createCombinedIndexSet() {
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
