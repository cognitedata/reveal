/*!
 * Copyright 2021 Cognite AS
 */
import { assertNever } from '../../../utilities';
import { IndexSet } from '../../../utilities/IndexSet';
import { NodeCollectionBase, SerializedNodeCollection } from './NodeCollection';

export type AggregateNodeCollectionOperator = 'intersection' | 'union';

/**
 * Node collection that combines the result from multiple underlying node collections.
 * by taking the set union or intersection between the sets.
 */
export class AggregateNodeCollection extends NodeCollectionBase {
  public static readonly classToken = 'AggregateNodeCollection';

  private _nodeCollection: NodeCollectionBase[] = [];
  private _operator: AggregateNodeCollectionOperator;
  private _changedUnderlyingNodeCollectionHandler: () => void;
  private _cachedCombinedCollection: IndexSet | undefined = undefined;

  constructor(combinationOperator: AggregateNodeCollectionOperator, nodeCollections?: NodeCollectionBase[]) {
    super(AggregateNodeCollection.classToken);

    this._changedUnderlyingNodeCollectionHandler = this.makeDirty.bind(this);
    this._operator = combinationOperator;
    if (nodeCollections) {
      nodeCollections.forEach(x => this.add(x));
    }
  }

  add(nodeCollection: NodeCollectionBase) {
    nodeCollection.on('changed', this._changedUnderlyingNodeCollectionHandler);
    this._nodeCollection.push(nodeCollection);
    this.makeDirty();
  }

  remove(nodeCollection: NodeCollectionBase) {
    const index = this._nodeCollection.indexOf(nodeCollection);
    if (index < 0) {
      throw new Error('Could not find set');
    }

    nodeCollection.off('changed', this._changedUnderlyingNodeCollectionHandler);
    this._nodeCollection.splice(index, 1);
    this.makeDirty();
  }

  /**
   * Clears all underlying node collections.
   */
  clear() {
    this._nodeCollection.forEach(collection => collection.clear());
  }

  private makeDirty(): void {
    if (this._cachedCombinedCollection === undefined) return;
    this._cachedCombinedCollection = undefined;
    this.notifyChanged();
  }

  /**
   * @override
   */
  getIndexSet(): IndexSet {
    this._cachedCombinedCollection = this._cachedCombinedCollection ?? this.createCachedCombinedCollection();
    return this._cachedCombinedCollection;
  }

  /**
   * @override
   */
  get isLoading(): boolean {
    return this._nodeCollection.some(x => x.isLoading);
  }

  private createCachedCombinedCollection(): IndexSet {
    switch (this._operator) {
      case 'intersection':
        return this.createIntersectionCollection();

      case 'union':
        return this.createUnionCollection();

      default:
        assertNever(this._operator);
    }
  }

  private createIntersectionCollection(): IndexSet {
    if (this._nodeCollection.length === 0) {
      return new IndexSet();
    }
    const set = this._nodeCollection[0].getIndexSet().clone();
    for (let i = 1; i < this._nodeCollection.length; ++i) {
      set.intersectWith(this._nodeCollection[i].getIndexSet());
    }
    return set;
  }

  private createUnionCollection(): IndexSet {
    if (this._nodeCollection.length === 0) {
      return new IndexSet();
    }
    const set = this._nodeCollection[0].getIndexSet().clone();
    for (let i = 1; i < this._nodeCollection.length; ++i) {
      set.unionWith(this._nodeCollection[i].getIndexSet());
    }
    return set;
  }

  /** @internal */
  serialize(): SerializedNodeCollection {
    return {
      token: this.classToken,
      state: {
        operator: this._operator,
        subCollections: this._nodeCollection.map(set => set.serialize())
      }
    };
  }
}
