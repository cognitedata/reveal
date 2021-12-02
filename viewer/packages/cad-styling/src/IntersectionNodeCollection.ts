/*!
 * Copyright 2021 Cognite AS
 */
import { NodeCollectionBase, SerializedNodeCollection } from './NodeCollectionBase';
import { UnionNodeCollection } from './UnionNodeCollection';
import { CombineNodeCollectionBase } from './CombineNodeCollectionBase';
import { AreaCollection } from './prioritized/AreaCollection';
import { EmptyAreaCollection } from './prioritized/EmptyAreaCollection';
import { ClusteredAreaCollection } from './prioritized/ClusteredAreaCollection';

import { IndexSet } from '@reveal/utilities';

/**
 * Node collection that is the intersection between a set of underlying node collections.
 */
export class IntersectionNodeCollection extends CombineNodeCollectionBase {
  private _cachedNodeAreas: AreaCollection | undefined = undefined;

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

  public makeDirty(): void {
    super.makeDirty();

    this._cachedNodeAreas = undefined;
  }

  public getAreas(): AreaCollection {
    if (this._cachedNodeAreas) {
      return this._cachedNodeAreas;
    }

    if (this._nodeCollections.length === 0) {
      this._cachedNodeAreas = EmptyAreaCollection.instance();
      return this._cachedNodeAreas;
    }

    const newAreaCollection = new ClusteredAreaCollection();
    newAreaCollection.addAreas(this._nodeCollections[0].getAreas().areas());
    for (let i = 1; i < this._nodeCollections.length; ++i) {
      newAreaCollection.intersectWith(this._nodeCollections[i].getAreas().areas());
    }

    this._cachedNodeAreas = newAreaCollection;
    return newAreaCollection;
  }
}
