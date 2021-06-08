/*!
 * Copyright 2021 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';
import { Cognite3DModel } from '../../../public/migration/Cognite3DModel';
import { IndexSet } from '../../../utilities/IndexSet';

import nock from 'nock';
import { NumericRange } from '../../../utilities';
import { ByNodePropertyMultiValueNodeSet } from './ByNodePropertyMultiValueNodeSet';

describe('ByNodePropertyMultiValueNodeSet', () => {
  let set: ByNodePropertyMultiValueNodeSet;
  let client: CogniteClient;
  let model: Cognite3DModel;
  const filterNodesEndpointPath = /.*\/nodes\/list/;

  beforeEach(() => {
    client = new CogniteClient({ appId: 'test', baseUrl: 'http://localhost' });
    client.loginWithApiKey({ apiKey: 'dummy', project: 'unittest' });
    model = { modelId: 112, revisionId: 113 } as Cognite3DModel;
    set = new ByNodePropertyMultiValueNodeSet(client, model);
  });

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll();
      fail(new Error('Not all nock interceptors were used!'));
    }
  });

  test('isLoading is initially false', () => {
    expect(set.isLoading).toBeFalse();
  });

  test('isLoading is true while executing request and false after', async () => {
    // Arrange
    nock(/.*/)
      .post(filterNodesEndpointPath)
      .reply(200, () => {
        return { items: [] };
      });

    // Act
    const promise = set.executeFilter('PDMS', ':capStatus', ['S8', 'S9']);

    // Assert
    expect(set.isLoading).toBeTrue();
    await promise;
    expect(set.isLoading).toBeFalse();
  });

  test('executeFilter() with empty result triggers change', async () => {
    // Arrange
    nock(/.*/)
      .post(filterNodesEndpointPath)
      .reply(200, () => {
        return { items: [] };
      });
    const listener = jest.fn();
    set.on('changed', listener);

    // Act
    await set.executeFilter('PDMS', ':capStatus', ['S8', 'S9']);

    // Assert
    expect(set.getIndexSet()).toEqual(new IndexSet());
    expect(listener).toBeCalled();
  });

  test('executeFilter() with single batch result, creates correct IndexSet', async () => {
    // Arrange
    nock(/.*/)
      .post(filterNodesEndpointPath)
      .reply(200, () => {
        return { items: [createNodeJson(10, 100), createNodeJson(110, 10)] };
      });

    // Act
    await set.executeFilter('PDMS', ':capStatus', ['S9']);

    // Assert
    const expectedSet = new IndexSet();
    expectedSet.addRange(new NumericRange(10, 100));
    expectedSet.addRange(new NumericRange(110, 10));
    expect(set.getIndexSet()).toEqual(expectedSet);
  });

  test('executeFilter() loops through all requests in response set', async () => {
    // Arrange
    nock(/.*/)
      .post(filterNodesEndpointPath)
      .reply(200, () => {
        return { items: [createNodeJson(1, 10), createNodeJson(20, 10)], nextCursor: 'abcdef' };
      });
    nock(/.*/)
      .post(filterNodesEndpointPath)
      .reply(200, () => {
        return { items: [createNodeJson(30, 10), createNodeJson(50, 10)] };
      });

    // Act
    await set.executeFilter('PDMS', 'Type', ['ARCH', 'PIPE']);

    // Assert
    const expectedSet = new IndexSet();
    expectedSet.addRange(new NumericRange(1, 10));
    expectedSet.addRange(new NumericRange(20, 10));
    expectedSet.addRange(new NumericRange(30, 10));
    expectedSet.addRange(new NumericRange(50, 10));
    expect(set.getIndexSet()).toEqual(expectedSet);
  });

  test('executeFilter() twice discards results from first request', async () => {
    // Arrange
    nock(/.*/)
      .post(filterNodesEndpointPath)
      .reply(200, () => {
        return { items: [createNodeJson(1, 10), createNodeJson(20, 10)] };
      });
    nock(/.*/)
      .post(filterNodesEndpointPath)
      .reply(200, () => {
        return { items: [createNodeJson(30, 10), createNodeJson(50, 10)] };
      });

    // Act
    const first = set.executeFilter('Foo', 'Bar', ['value1', 'value2']);
    const second = set.executeFilter('FooBar', 'BarFoo', ['foo foo', 'bar foo', 'foo bar']);

    // Assert
    await first;
    await second;
    const expectedSet = new IndexSet();
    expectedSet.addRange(new NumericRange(30, 10));
    expectedSet.addRange(new NumericRange(50, 10));
    expect(set.getIndexSet()).toEqual(expectedSet);
    expect(set.isLoading).toBeFalse();
  });

  test('executeFilter() with two partitions, finishes and merges both', async () => {
    // Arrange
    set = new ByNodePropertyMultiValueNodeSet(client, model, { requestPartitions: 2 });

    nock(/.*/)
      .post(filterNodesEndpointPath)
      .twice()
      .reply(200, uri => {
        const searchParams = new URLSearchParams(uri);
        const partition = searchParams.get('partition');
        switch (partition) {
          case '1/2':
            return { items: [createNodeJson(1, 10)] };
          case '2/2':
            return { items: [createNodeJson(30, 10)] };
          default:
            fail(`Unexpected partition '${partition}'`);
        }
      });

    // Act
    await set.executeFilter('Foo', 'Bar', ['value1', 'value2']);

    // Assert
    const expectedSet = new IndexSet();
    expectedSet.addRange(new NumericRange(1, 10));
    expectedSet.addRange(new NumericRange(30, 10));
    expect(set.getIndexSet().toArray()).toEqual(expectedSet.toArray());
    expect(set.isLoading).toBeFalse();
  });

  test('executeFilter() with very many values, splits into multiple requests', async () => {
    // Arrange
    nock(/.*/)
      .post(filterNodesEndpointPath)
      .reply(200, () => {
        return { items: [createNodeJson(1, 10)] }; // First batch
      });
    nock(/.*/)
      .post(filterNodesEndpointPath)
      .reply(200, () => {
        return { items: [createNodeJson(30, 10)] }; // Second batch
      });

    // Act
    const values = new NumericRange(0, 1500).toArray().map(x => `value${x}`);
    await set.executeFilter('Foo', 'Bar', values);

    // Assert
    const expectedSet = new IndexSet();
    expectedSet.addRange(new NumericRange(1, 10));
    expectedSet.addRange(new NumericRange(30, 10));
    expect(set.getIndexSet().toArray()).toEqual(expectedSet.toArray());
    expect(set.isLoading).toBeFalse();
  });

  test('clear() interrupts ongoing operation and resets set', async () => {
    // Arrange
    nock(/.*/)
      .get(filterNodesEndpointPath)
      .reply(200, () => {
        return { items: [createNodeJson(10, 100)] };
      });

    // Act
    const executeFilterOperation = set.executeFilter('PDMS', ':FU', ['A', 'B', 'C']);
    set.clear();
    await executeFilterOperation;

    // Assert
    expect(set.isLoading).toBeFalse();
    expect(set.getIndexSet()).toEqual(new IndexSet());
  });
});

function createNodeJson(treeIndex: number, subtreeSize: number) {
  return { treeIndex: treeIndex, subtreeSize };
}
