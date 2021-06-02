/*!
 * Copyright 2021 Cognite AS
 */
import { Cognite3DModel } from '../../../public/migration/Cognite3DModel';
import { NumericRange } from '../../../utilities';
import { IndexSet } from '../../../utilities/IndexSet';
import { NodeSet } from './NodeSet';

export class InvertedNodeSet extends NodeSet {
  private readonly _allTreeIndicesRange: NumericRange;
  private readonly _innerSet: NodeSet;
  private _cachedIndexSet?: IndexSet;

  constructor(model: Cognite3DModel, innerSet: NodeSet) {
    super(InvertedNodeSet.name);
    this._innerSet = innerSet;
    this._innerSet.on('changed', () => {
      this._cachedIndexSet = undefined;
      this.notifyChanged();
    });

    this._allTreeIndicesRange = new NumericRange(0, model.nodeCount);
  }

  get isLoading(): boolean {
    return this._innerSet.isLoading;
  }

  getIndexSet(): IndexSet {
    if (this._cachedIndexSet === undefined) {
      const inner = this._innerSet.getIndexSet();
      const invertedIndices = new IndexSet();
      invertedIndices.addRange(this._allTreeIndicesRange);
      invertedIndices.differenceWith(inner);
      this._cachedIndexSet = invertedIndices;
    }
    return this._cachedIndexSet;
  }
}
