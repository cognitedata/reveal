/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { NumericRange } from '@reveal/utilities';
import { PopulateIndexSetFromPagedResponseHelper } from './PopulateIndexSetFromPagedResponseHelper';
import { ListResponse } from '@cognite/sdk-core';
import { sleep } from '../../../../../test-utilities';

describe('PopulateIndexSetFromPagedResponseHelper', () => {
  let helper: PopulateIndexSetFromPagedResponseHelper<number>;
  let notifyChangedCallback: () => void;

  beforeEach(() => {
    notifyChangedCallback = jest.fn();
    helper = new PopulateIndexSetFromPagedResponseHelper<number>(
      x => new NumericRange(x, 1),
      x => new THREE.Box3().setFromArray([x, x, x, x + 1, x + 1, x + 1]),
      notifyChangedCallback
    );
  });

  test('is interrupted before paging results, returns not completed ', async () => {
    const response = createResponse<number>([], 1000);

    helper.interrupt();
    const { completed, indexSet, areas } = await helper.pageResults(Promise.resolve(response));
    expect(completed).toBeFalse();
    expect(indexSet.count).toBe(0);
    expect(areas).toBeEmpty();
    expect(helper.isLoading).toBeFalse();
  });

  test('is not interrupted, fetches all pages and populates set', async () => {
    const response = createResponse([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5);

    const { completed, indexSet, areas } = await helper.pageResults(Promise.resolve(response));
    expect(completed).toBeTrue();
    expect(indexSet.toIndexArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(areas).not.toBeEmpty();
    expect(helper.isLoading).toBeFalse();
  });

  test('is interrupted after first page is fetched, partially populates the set', async () => {
    const response = createResponse([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5);
    const originalNext = response.next!;
    response.next = () => {
      helper.interrupt();
      return originalNext();
    };

    const { completed, indexSet, areas } = await helper.pageResults(Promise.resolve(response));
    expect(completed).toBeFalse();
    expect(indexSet.toIndexArray()).toEqual([1, 2, 3, 4, 5]);
    expect(areas).not.toBeEmpty();
    expect(helper.isLoading).toBeFalse();
    expect(notifyChangedCallback).toBeCalledTimes(1);
  });

  test('isLoading returns true while processing pages', async () => {
    const response = createResponse([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5);

    const operation = helper.pageResults(Promise.resolve(response));
    expect(helper.isLoading).toBeTrue();
    const { completed } = await operation;
    expect(completed).toBeTrue();
    expect(helper.isLoading).toBeFalse();
  });

  test('two concurrent load operations, both populate indexset', async () => {
    const response1 = createResponse([1, 2, 3, 4], 2, () => sleep(50));
    const response2 = createResponse([5, 6, 7, 8], 2, () => sleep(100));

    const operation1 = helper.pageResults(Promise.resolve(response1));
    const operation2 = helper.pageResults(Promise.resolve(response2));
    expect(helper.isLoading).toBeTrue();
    const { completed: completed1, indexSet: indexSet1, areas: areas1 } = await operation1;
    expect(completed1).toBeTrue();
    expect(indexSet1.toIndexArray()).toEqual([1, 2, 3, 4, 5, 6]);
    expect(areas1).not.toBeEmpty();
    expect(helper.isLoading).toBeTrue();
    const { completed: completed2, indexSet: indexSet2, areas: areas2 } = await operation2;
    expect(completed2).toBeTrue();
    expect(indexSet2.toIndexArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(areas2).not.toBeEmpty();
    expect(helper.isLoading).toBeFalse();

    expect(notifyChangedCallback).toBeCalledTimes(4);
  });
});

function createResponse<T>(items: T[], pageSize: number, nextPageCallback?: () => Promise<void>): ListResponse<T[]> {
  function createPage(offset: number): ListResponse<T[]> {
    const page: ListResponse<T[]> = {
      items: items.slice(offset, offset + pageSize),
      nextCursor: items.length > offset + pageSize ? 'cursor' : undefined,
      next:
        items.length > offset + pageSize
          ? async () => {
              if (nextPageCallback !== undefined) {
                await nextPageCallback();
              }
              return createPage(offset + pageSize);
            }
          : undefined
    };
    return page;
  }
  return createPage(0);
}
