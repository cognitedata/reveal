/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { ListResponse } from '@cognite/sdk';
import { IndexSet, NumericRange } from '@reveal/utilities';
import { AreaCollection, SimpleAreaCollection } from '@reveal/cad-styling';

/**
 * Helper class that populates an IndexSet based on a paged results from the Cognite SDK.
 */
export class PopulateIndexSetFromPagedResponseHelper<T> {
  private readonly _itemToTreeIndexRangeCallback: (item: T) => NumericRange;
  private readonly _itemToAreaCallback: (item: T) => THREE.Box3;
  private readonly _notifyChangedCallback: () => void;

  private _ongoingOperations = 0;
  private _interrupted = false;
  private _indexSet = new IndexSet();
  private _areas = new SimpleAreaCollection();

  constructor(
    itemToTreeIndexRangeCallback: (item: T) => NumericRange,
    itemToAreaCallback: (item: T) => THREE.Box3,
    notifySetChangedCallback: () => void
  ) {
    this._itemToTreeIndexRangeCallback = itemToTreeIndexRangeCallback;
    this._itemToAreaCallback = itemToAreaCallback;
    this._notifyChangedCallback = notifySetChangedCallback;
  }

  interrupt() {
    this._interrupted = true;
  }

  public get isLoading(): boolean {
    return !this._interrupted && this._ongoingOperations > 0;
  }

  public get indexSet(): IndexSet {
    return this._indexSet;
  }

  public get areas(): AreaCollection {
    return this._areas;
  }

  /**
   * Loops through all the pages of the provided response and populated the IndexSet provided.
   * @param request
   * @returns True if the operation was completed, false if it was interrupted using {@link interrupt}.
   */
  public async pageResults(request: Promise<ListResponse<T[]>>): Promise<boolean> {
    const itemToTreeIndexRangeCallback = this._itemToTreeIndexRangeCallback;
    const notifyChangedCallback = this._notifyChangedCallback;
    this._ongoingOperations++;
    try {
      let response: ListResponse<T[]> = await request;
      while (!this._interrupted) {
        const nextRequest = response.next ? response.next() : undefined;
        response.items.forEach(x => {
          const range = itemToTreeIndexRangeCallback(x);
          this._indexSet.addRange(range);

          const area = this._itemToAreaCallback(x);
          this._areas.addArea(area);
        });
        notifyChangedCallback();

        if (nextRequest) {
          response = await nextRequest;
        } else {
          break;
        }
      }

      return !this._interrupted;
    } finally {
      this._ongoingOperations--;
    }
  }
}
