/*!
 * Copyright 2021 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';
import { IndexSet, NumericRange } from '@reveal/utilities';
import { PropertyFilterNodeCollection } from './PropertyFilterNodeCollection';

import nock from 'nock';
import { CdfModelNodeCollectionDataProvider } from './CdfModelNodeCollectionDataProvider';

describe(PropertyFilterNodeCollection.name, () => {
  let client: CogniteClient;
  let model: CdfModelNodeCollectionDataProvider;
  let set: PropertyFilterNodeCollection;
  const listNodesEndpointPath: RegExp = /.*\/nodes/;

  beforeEach(() => {
    client = new CogniteClient({
      appId: 'test',
      project: 'dummy',
      getToken: async () => 'dummy'
    });

    model = { modelId: 112, revisionId: 113 } as CdfModelNodeCollectionDataProvider;
    set = new PropertyFilterNodeCollection(client, model);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  test('isLoading is initially false', () => {
    expect(set.isLoading).toBeFalse();
  });

  test('isLoading is true while executing request and false after', async () => {
    // Arrange
    nock(/.*/)
      .get(listNodesEndpointPath)
      .reply(200, () => {
        return { items: [] };
      });

    // Act
    const promise = set.executeFilter({ PDMS: { ':capStatus': 'S9' } });

    // Assert
    expect(set.isLoading).toBeTrue();
    await promise;
    expect(set.isLoading).toBeFalse();
  });

  test('executeFilter() with empty result triggers change', async () => {
    // Arrange
    nock(/.*/)
      .get(listNodesEndpointPath)
      .reply(200, () => {
        return { items: [] };
      });
    const listener = jest.fn();
    set.on('changed', listener);

    // Act
    await set.executeFilter({ PDMS: { ':capStatus': 'S9' } });

    // Assert
    expect(set.getIndexSet()).toEqual(new IndexSet());
    expect(listener).toBeCalled();
  });

  test('executeFilter() with single batch result, creates correct IndexSet', async () => {
    // Arrange
    nock(/.*/)
      .get(listNodesEndpointPath)
      .reply(200, () => {
        return { items: [createNodeJson(10, 100), createNodeJson(110, 10)] };
      });

    // Act
    await set.executeFilter({ PDMS: { ':capStatus': 'S9' } });

    // Assert
    const expectedSet = new IndexSet();
    expectedSet.addRange(new NumericRange(10, 100));
    expectedSet.addRange(new NumericRange(110, 10));
    expect(set.getIndexSet()).toEqual(expectedSet);
  });

  test('executeFilter() loops through all requests in response set', async () => {
    // Arrange
    nock(/.*/)
      .get(listNodesEndpointPath)
      .reply(200, () => {
        return { items: [createNodeJson(1, 10), createNodeJson(20, 10)], nextCursor: 'abcdef' };
      });
    nock(/.*/)
      .get(listNodesEndpointPath)
      .reply(200, () => {
        return { items: [createNodeJson(30, 10), createNodeJson(50, 10)] };
      });

    // Act
    await set.executeFilter({ PDMS: { Type: 'PIPE' } });

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
      .get(listNodesEndpointPath)
      .reply(200, () => {
        return { items: [createNodeJson(1, 10), createNodeJson(20, 10)] };
      });
    nock(/.*/)
      .get(listNodesEndpointPath)
      .reply(200, () => {
        return { items: [createNodeJson(30, 10), createNodeJson(50, 10)] };
      });

    // Act
    const first = set.executeFilter({ Foo: { Bar: 'value' } });
    const second = set.executeFilter({ FooBar: { BarFoo: 'foo foo' } });

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
    set = new PropertyFilterNodeCollection(client, model, { requestPartitions: 2 });

    nock(/.*/)
      .get(listNodesEndpointPath)
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
    await set.executeFilter({ Foo: { Bar: 'value' } });

    // Assert
    const expectedSet = new IndexSet();
    expectedSet.addRange(new NumericRange(1, 10));
    expectedSet.addRange(new NumericRange(30, 10));
    expect(set.getIndexSet()).toEqual(expectedSet);
    expect(set.isLoading).toBeFalse();
  });

  test('clear() interrupts ongoing operation and resets set', async () => {
    // Arrange
    nock(/.*/)
      .get(listNodesEndpointPath)
      .reply(200, () => {
        return { items: [createNodeJson(10, 100)] };
      });

    // Act
    const executeFilterOperation = set.executeFilter({ PDMS: { ':capStatus': 'S9' } });
    set.clear();
    await executeFilterOperation;

    // Assert
    expect(set.isLoading).toBeFalse();
    expect(set.getIndexSet()).toEqual(new IndexSet());
  });
});

function createNodeJson(treeIndex: number, subtreeSize: number) {
  // Note! Only partial JSON of what will actually be returned but all we need
  return { treeIndex: treeIndex, subtreeSize };
}
