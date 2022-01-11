/*!
 * Copyright 2021 Cognite AS
 */

import { IndexSet } from '@reveal/utilities';
import { NodeCollectionBase, SerializedNodeCollection } from '../NodeCollectionBase';

export class StubNodeCollection extends NodeCollectionBase {
  private _indexSet = new IndexSet();
  private _isLoading = false;

  constructor() {
    super('stub');
  }

  get isLoading(): boolean {
    return this._isLoading;
  }
  set isLoading(v: boolean) {
    this._isLoading = v;
  }
  getIndexSet(): IndexSet {
    return this._indexSet;
  }
  setIndexSet(set: IndexSet): void {
    this._indexSet = set;
  }
  clear(): void {
    this._indexSet = new IndexSet();
  }
  serialize(): SerializedNodeCollection {
    return { token: 'stub', state: {} };
  }

  triggerChanged(): void {
    this.notifyChanged();
  }
}
