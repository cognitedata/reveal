/*!
 * Copyright 2021 Cognite AS
 */
import { NumericRange, IndexSet } from '@reveal/utilities';

import { AreaCollection } from './prioritized/AreaCollection';
import { CdfModelNodeCollectionDataProvider } from './CdfModelNodeCollectionDataProvider';
import { NodeCollection } from './NodeCollection';
import { SerializedNodeCollection } from './SerializedNodeCollection';

/**
 * Node collection that inverts the result from another node collection.
 */
export class InvertedNodeCollection extends NodeCollection {
  public static readonly classToken = 'InvertedNodeCollection';

  private readonly _allTreeIndicesRange: NumericRange;
  private readonly _innerCollection: NodeCollection;
  private _cachedIndexSet?: IndexSet;

  constructor(model: CdfModelNodeCollectionDataProvider, innerSet: NodeCollection) {
    super(InvertedNodeCollection.classToken);
    this._innerCollection = innerSet;
    this._innerCollection.on('changed', () => {
      this._cachedIndexSet = undefined;
      this.notifyChanged();
    });

    this._allTreeIndicesRange = new NumericRange(0, model.nodeCount);
  }

  get isLoading(): boolean {
    return this._innerCollection.isLoading;
  }

  getIndexSet(): IndexSet {
    if (this._cachedIndexSet === undefined) {
      const inner = this._innerCollection.getIndexSet();
      const invertedIndices = new IndexSet();
      invertedIndices.addRange(this._allTreeIndicesRange);
      invertedIndices.differenceWith(inner);
      this._cachedIndexSet = invertedIndices;
    }
    return this._cachedIndexSet;
  }

  getAreas(): AreaCollection {
    throw new Error(`${this.getAreas.name} is not supported for ${InvertedNodeCollection.name}`);
  }

  serialize(): SerializedNodeCollection {
    return { token: this.classToken, state: { innerCollection: this._innerCollection.serialize() } };
  }
  /**
   * Not supported.
   * @throws Always throws an error.
   */
  clear(): never {
    // clearing the underlying set would result in all nodes being added to this set
    // which would feel counter-intuitive.
    throw new Error('clear() is not supported');
  }
}
