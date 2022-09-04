/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { PopulateIndexSetFromPagedResponseHelper } from './PopulateIndexSetFromPagedResponseHelper';

import { sleep } from '../../../test-utilities';

import { NumericRange } from '@reveal/utilities';
import { createListResponse } from './stubs/createListResponse';

describe(PopulateIndexSetFromPagedResponseHelper.name, () => {
  let helper: PopulateIndexSetFromPagedResponseHelper<number>;
  let notifyChangedCallback: () => void;

  beforeEach(() => {
    notifyChangedCallback = jest.fn();
    helper = new PopulateIndexSetFromPagedResponseHelper<number>(
      xs => xs.map(x => new NumericRange(x, 1)),
      async xs => xs.map(x => new THREE.Box3().setFromArray([x, x, x, x + 1, x + 1, x + 1])),
      notifyChangedCallback
    );
  });

  test('is interrupted before paging results, returns not completed ', async () => {
    const response = createListResponse<number>([], 1000);

    helper.interrupt();
    const completed = await helper.pageResults(Promise.resolve(response));
    expect(completed).toBeFalse();
    expect(helper.indexSet.count).toBe(0);
    expect(helper.areas.isEmpty).toBeTrue();
    expect(helper.isLoading).toBeFalse();
  });

  test('is not interrupted, fetches all pages and populates set', async () => {
    const response = createListResponse([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5);

    const completed = await helper.pageResults(Promise.resolve(response));
    expect(completed).toBeTrue();
    expect(helper.indexSet.toIndexArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(helper.areas.isEmpty).toBeFalse();
    expect(helper.isLoading).toBeFalse();
  });

  test('is interrupted after first page is fetched, partially populates the set', async () => {
    const response = createListResponse([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5);
    const originalNext = response.next!;
    response.next = () => {
      helper.interrupt();
      return originalNext();
    };

    const completed = await helper.pageResults(Promise.resolve(response));
    expect(completed).toBeFalse();
    expect(helper.indexSet.toIndexArray()).toEqual([1, 2, 3, 4, 5]);
    expect(helper.areas.isEmpty).toBeFalse();
    expect(helper.isLoading).toBeFalse();
    expect(notifyChangedCallback).toBeCalledTimes(1);
  });

  test('isLoading returns true while processing pages', async () => {
    const response = createListResponse([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5);

    const operation = helper.pageResults(Promise.resolve(response));
    expect(helper.isLoading).toBeTrue();
    const completed = await operation;
    expect(completed).toBeTrue();
    expect(helper.isLoading).toBeFalse();
  });

  test('two concurrent load operations, both populate collections', async () => {
    const response1 = createListResponse([1, 2, 3, 4], 2, () => sleep(50));
    const response2 = createListResponse([5, 6, 7, 8], 2, () => sleep(100));

    const operation1 = helper.pageResults(Promise.resolve(response1));
    const operation2 = helper.pageResults(Promise.resolve(response2));
    expect(helper.isLoading).toBeTrue();
    const completed1 = await operation1;
    expect(completed1).toBeTrue();
    expect(helper.indexSet.toIndexArray()).toEqual([1, 2, 3, 4, 5, 6]);
    expect(helper.areas.isEmpty).toBeFalse();
    expect(helper.isLoading).toBeTrue();
    const completed2 = await operation2;
    expect(completed2).toBeTrue();
    expect(helper.indexSet.toIndexArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(helper.areas.isEmpty).toBeFalse();
    expect(helper.areas).not.toBeEmpty();
    expect(helper.isLoading).toBeFalse();

    expect(notifyChangedCallback).toBeCalledTimes(4);
  });

  test('with filter, only processes and returns accepted items', async () => {
    const response = createListResponse([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5);
    const filterCallback = jest.fn(async (items: number[]) => items.filter(x => x % 2 === 0));
    helper.setFilterItemsCallback(filterCallback);

    await helper.pageResults(Promise.resolve(response));

    expect(filterCallback).toBeCalledTimes(2); // two batches
    expect(helper.indexSet.toIndexArray()).toEqual([2, 4, 6, 8, 10]);
  });
});
