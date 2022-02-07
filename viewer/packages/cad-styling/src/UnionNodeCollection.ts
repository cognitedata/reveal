/*!
 * Copyright 2021 Cognite AS
 */
import { SerializedNodeCollection } from './SerializedNodeCollection';
import { NodeCollection } from './NodeCollection';
import { CombineNodeCollectionBase } from './CombineNodeCollectionBase';
import { AreaCollection } from './prioritized/AreaCollection';
import { ClusteredAreaCollection } from './prioritized/ClusteredAreaCollection';

import { IndexSet } from '@reveal/utilities';

/**
 * Node collection that takes the set union of multiple node collections.
 */

export class UnionNodeCollection extends CombineNodeCollectionBase {
  private _cachedNodeAreas: AreaCollection | undefined = undefined;

  public static readonly classToken = 'UnionNodeCollection';

  constructor(nodeCollections?: NodeCollection[]) {
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

  public getAreas(): AreaCollection {
    if (this._cachedNodeAreas) {
      return this._cachedNodeAreas;
    }

    const newAreaCollection = new ClusteredAreaCollection();

    for (let i = 0; i < this._nodeCollections.length; ++i) {
      newAreaCollection.addAreas(this._nodeCollections[i].getAreas().areas());
    }

    this._cachedNodeAreas = newAreaCollection;
    return newAreaCollection;
  }
}
