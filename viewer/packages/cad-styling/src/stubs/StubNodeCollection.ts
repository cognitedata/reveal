/*!
 * Copyright 2021 Cognite AS
 */

import { IndexSet } from '@reveal/utilities';
import { AreaCollection } from '../prioritized/AreaCollection';
import { EmptyAreaCollection } from '../prioritized/EmptyAreaCollection';
import { NodeCollection } from '../NodeCollection';
import { SerializedNodeCollection } from '../SerializedNodeCollection';

export class StubNodeCollection extends NodeCollection {
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
  setAreas(areas: AreaCollection): void {
    this._areas = areas;
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
