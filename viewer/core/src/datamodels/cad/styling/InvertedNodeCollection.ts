/*!
 * Copyright 2021 Cognite AS
 */
import { Cognite3DModel } from '../../../public/migration/Cognite3DModel';
import { NumericRange, IndexSet } from '@reveal/utilities';

import { AreaCollection, NodeCollectionBase, SerializedNodeCollection } from '@reveal/cad-styling';

/**
 * Node collection that inverts the result from another node collection.
 */
export class InvertedNodeCollection extends NodeCollectionBase {
  public static readonly classToken = 'InvertedNodeCollection';

  private readonly _allTreeIndicesRange: NumericRange;
  private readonly _innerCollection: NodeCollectionBase;
  private _cachedIndexSet?: IndexSet;

  constructor(model: Cognite3DModel, innerSet: NodeCollectionBase) {
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
