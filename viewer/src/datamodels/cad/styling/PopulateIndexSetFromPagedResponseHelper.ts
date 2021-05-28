/*!
 * Copyright 2021 Cognite AS
 */

import { ListResponse } from '@cognite/sdk';
import { IndexSet } from '../../../utilities/IndexSet';
import { NumericRange } from '../../../utilities/NumericRange';

/**
 * Helper class that populates an IndexSet based on a paged results from the Cognite SDK.
 */
export class PopulateIndexSetFromPagedResponseHelper<T> {
  private readonly _itemToTreeIndexRangeCallback: (item: T) => NumericRange;
  private readonly _notifySetChangedCallback: () => void;

  private _ongoingOperations = 0;
  private _interrupted = false;

  constructor(itemToTreeIndexRangeCallback: (item: T) => NumericRange, notifySetChangedCallback: () => void) {
    this._itemToTreeIndexRangeCallback = itemToTreeIndexRangeCallback;
    this._notifySetChangedCallback = notifySetChangedCallback;
  }

  interrupt() {
    this._interrupted = true;
  }

  public get isLoading(): boolean {
    return !this._interrupted && this._ongoingOperations > 0;
  }

  /**
   * Loops through all the pages of the provided response and populated the IndexSet provided.
   * @param indexSet
   * @param request
   * @returns True if the operation was completed, false if it was interrupted using {@link interrupt}.
   */
  public async pageResults(indexSet: IndexSet, request: Promise<ListResponse<T[]>>): Promise<boolean> {
    const itemToTreeIndexRangeCallback = this._itemToTreeIndexRangeCallback;
    const notifySetChangedCallback = this._notifySetChangedCallback;
    this._ongoingOperations++;
    try {
      let response: ListResponse<T[]> = await request;
      while (!this._interrupted) {
        const nextRequest = response.next ? response.next() : undefined;
        response.items.forEach(x => {
          const range = itemToTreeIndexRangeCallback(x);
          indexSet.addRange(range);
        });
        notifySetChangedCallback();

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
