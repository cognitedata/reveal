/*!
 * Copyright 2021 Cognite AS
 */

import { NumericRange } from "../../../utilities";
import { IndexSet } from "../../../utilities/IndexSet";
import { PopulateIndexSetFromPagedResponseHelper } from "./PopulateIndexSetFromPagedResponseHelper";
import { ListResponse } from '@cognite/sdk-core';
import { sleep } from "../../../__testutilities__/wait";

describe('PopulateIndexSetFromPagedResponseHelper', () => {
  let helper: PopulateIndexSetFromPagedResponseHelper<number>;
  let notifyChangedCallback: () => void;

  beforeEach(() => {
    jest.useFakeTimers('modern');

    notifyChangedCallback = jest.fn();
    helper = new PopulateIndexSetFromPagedResponseHelper<number>(x => new NumericRange(x, 1), notifyChangedCallback);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('is interrupted before paging results, returns false', async () => {
    const indexSet = new IndexSet();
    const response = createResponse<number>([], 1000);

    helper.interrupt();
    const completed = await helper.pageResults(indexSet, response);
    expect(completed).toBeFalse();
    expect(indexSet.count).toBe(0);
    expect(helper.isLoading).toBeFalse();
  });

  test('is not interrupted, fetches all pages and populates set', async () => {
    const indexSet = new IndexSet();
    const response = createResponse([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5);

    const completed = await helper.pageResults(indexSet, response);
    expect(completed).toBeTrue();
    expect(indexSet.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(helper.isLoading).toBeFalse();
  });

  test('is interrupted after first page is fetched, partially populates the set', async () => {
    const indexSet = new IndexSet();
    const response = createResponse([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5);
    const originalNext = response.next!;
    response.next = () => {
      helper.interrupt();
      return originalNext();
    };

    const completed = await helper.pageResults(indexSet, response);
    expect(completed).toBeFalse();
    expect(indexSet.toArray()).toEqual([1, 2, 3, 4, 5]);
    expect(helper.isLoading).toBeFalse();
    expect(notifyChangedCallback).toBeCalledTimes(1);
  });

  test('isLoading returns true while processing pages', async () => {
    const indexSet = new IndexSet();
    const response = createResponse([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5, () => sleep(1000));
    
    const operation = helper.pageResults(indexSet, response);
    expect(helper.isLoading).toBeTrue();
    jest.advanceTimersByTime(10000);
    const completed = await operation;
    expect(completed).toBeTrue();
    expect(helper.isLoading).toBeFalse();
  });

  test('two concurrent load operations, both populate indexset', async () => {
    const indexSet = new IndexSet();
    const response1 = createResponse([1,2,3,4], 2, () => sleep(100));
    const response2 = createResponse([5,6,7,8], 2, () => sleep(1000));
    
    const operation1 = helper.pageResults(indexSet, response1);
    const operation2 = helper.pageResults(indexSet, response2);    
    expect(helper.isLoading).toBeTrue();
    jest.advanceTimersByTime(500);
    expect(await operation1).toBeTrue();
    expect(indexSet.toArray()).toEqual([1,2,3,4,5,6]);
    expect(helper.isLoading).toBeTrue();
    jest.advanceTimersByTime(1000);
    expect(await operation2).toBeTrue();
    expect(indexSet.toArray()).toEqual([1,2,3,4,5,6,7,8]);
    expect(helper.isLoading).toBeFalse();

    expect(notifyChangedCallback).toBeCalledTimes(4);
  });
});

function createResponse<T>(items: T[], pageSize: number, nextPageCallback?: () => Promise<void>): ListResponse<T[]> {
  function createPage(offset: number): ListResponse<T[]> {
    const page: ListResponse<T[]> = {
      items: items.slice(offset, offset + pageSize),
      nextCursor: items.length > offset + pageSize ? 'cursor' : undefined,
      next: items.length > offset + pageSize ? async () => {
        if (nextPageCallback !== undefined) {
          await nextPageCallback();
        }
        return createPage(offset + pageSize);
       } : undefined
    };
    return page;
  }
  return createPage(0);
}