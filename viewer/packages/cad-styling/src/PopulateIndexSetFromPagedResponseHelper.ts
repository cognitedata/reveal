/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { ListResponse } from '@cognite/sdk';
import { IndexSet, NumericRange } from '@reveal/utilities';
import { AreaCollection } from './prioritized/AreaCollection';
import { ClusteredAreaCollection } from './prioritized/ClusteredAreaCollection';

/**
 * Helper class that populates an IndexSet based on a paged results from the Cognite SDK.
 */
export class PopulateIndexSetFromPagedResponseHelper<T> {
  private readonly _itemsToTreeIndexRangesCallback: (item: T[]) => NumericRange[];
  private readonly _itemsToAreasCallback: (item: T[]) => Promise<THREE.Box3[]>;
  private readonly _notifyChangedCallback: () => void;

  private _ongoingOperations = 0;
  private _interrupted = false;
  private readonly _indexSet = new IndexSet();
  private readonly _areas = new ClusteredAreaCollection();

  constructor(
    itemsToTreeIndexRangesCallback: (items: T[]) => NumericRange[],
    itemsToAreasCallback: (items: T[]) => Promise<THREE.Box3[]>,
    notifySetChangedCallback: () => void
  ) {
    this._itemsToTreeIndexRangesCallback = itemsToTreeIndexRangesCallback;
    this._itemsToAreasCallback = itemsToAreasCallback;
    this._notifyChangedCallback = notifySetChangedCallback;
  }

  interrupt(): void {
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
    const indexSet = this._indexSet;

    this._ongoingOperations++;
    try {
      let response: ListResponse<T[]> = await request;
      while (!this._interrupted) {
        const nextRequest = response.next ? response.next() : undefined;

        const ranges = this._itemsToTreeIndexRangesCallback(response.items);
        ranges.forEach(range => indexSet.addRange(range));

        const areas = await this._itemsToAreasCallback(response.items);
        this._areas.addAreas(areas);

        this._notifyChangedCallback();

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
