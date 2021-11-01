/*!
 * Copyright 2021 Cognite AS
 */

import { IndexSet } from '@reveal/utilities';
import { AreaCollection } from '../prioritized/AreaCollection';
import { EmptyAreaCollection } from '../prioritized/EmptyAreaCollection';
import { NodeCollectionBase, SerializedNodeCollection } from '../NodeCollectionBase';

export class StubNodeCollection extends NodeCollectionBase {
  private _indexSet = new IndexSet();
  private _areas: AreaCollection = EmptyAreaCollection.instance();
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
  getAreas(): AreaCollection {
    return this._areas;
  }
  setAreas(areas: AreaCollection) {
    this._areas = areas;
  }
  setIndexSet(set: IndexSet) {
    this._indexSet = set;
  }
  clear() {
    this._indexSet = new IndexSet();
  }
  serialize(): SerializedNodeCollection {
    return { token: 'stub', state: {} };
  }

  triggerChanged(): void {
    this.notifyChanged();
  }
}
