/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { CogniteClient } from '@cognite/sdk';

import { SinglePropertyFilterNodeCollection } from './SinglePropertyFilterNodeCollection';
import { IndexSet, NumericRange } from '@reveal/utilities';

import nock from 'nock';
import { CdfModelNodeCollectionDataProvider } from './CdfModelNodeCollectionDataProvider';
import { It, Mock } from 'moq.ts';

describe('SinglePropertyFilterNodeCollection', () => {
  let mockClient: Mock<CogniteClient>;
  let mockModel: Mock<CdfModelNodeCollectionDataProvider>;
  let set: SinglePropertyFilterNodeCollection;

  beforeEach(() => {
    mockClient = new Mock<CogniteClient>();
    mockClient.setup(x => x.getBaseUrl()).returns('https://mycdf');

    mockModel = new Mock<CdfModelNodeCollectionDataProvider>();
    mockModel.setup(x => x.mapBoxFromCdfToModelCoordinates(It.IsAny(), It.IsAny())).returns(new THREE.Box3());

    set = new SinglePropertyFilterNodeCollection(mockClient.object(), mockModel.object());
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
    setupPostReturn(mockClient, 200, { items: [] });

    // Act
    const promise = set.executeFilter('PDMS', ':capStatus', ['S8', 'S9']);

    // Assert
    expect(set.isLoading).toBeTrue();
    await promise;
    expect(set.isLoading).toBeFalse();
  });

  test('executeFilter() with empty result triggers change', async () => {
    // Arrange
    setupPostReturn(mockClient, 200, { items: [] });

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
    setupPostReturn(mockClient, 200, { items: [createNodeJson(10, 100), createNodeJson(110, 10)] });

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
    setupPostReturn(
      mockClient,
      200,
      { items: [createNodeJson(1, 10), createNodeJson(20, 10)], nextCursor: 'abcdef' },
      { items: [createNodeJson(30, 10), createNodeJson(50, 10)] }
    );

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
    setupPostReturn(
      mockClient,
      200,
      { items: [createNodeJson(1, 10), createNodeJson(20, 10)] },
      { items: [createNodeJson(30, 10), createNodeJson(50, 10)] }
    );

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
    expect(set.getAreas()).not.toBeEmpty();
    expect(set.isLoading).toBeFalse();
  });

  test('executeFilter() with two partitions, finishes and merges both', async () => {
    // Arrange
    setupPostReturn(
      mockClient,
      200,
      { items: [createNodeJson(1, 10)], nextCursor: 'abc' },
      { items: [createNodeJson(30, 10)] }
    );

    // Act
    await set.executeFilter('Foo', 'Bar', ['value1', 'value2']);

    // Assert
    const expectedSet = new IndexSet();
    expectedSet.addRange(new NumericRange(1, 10));
    expectedSet.addRange(new NumericRange(30, 10));
    expect(set.getIndexSet().toIndexArray()).toEqual(expectedSet.toIndexArray());
    expect(set.isLoading).toBeFalse();
  });

  test('executeFilter() with very many values, splits into multiple requests', async () => {
    // Arrange
    setupPostReturn(mockClient, 200, { items: [createNodeJson(1, 10)] }, { items: [createNodeJson(30, 10)] });

    // Act
    const values = new NumericRange(0, 1500).toArray().map(x => `value${x}`);
    await set.executeFilter('Foo', 'Bar', values);

    // Assert
    const expectedSet = new IndexSet();
    expectedSet.addRange(new NumericRange(1, 10));
    expectedSet.addRange(new NumericRange(30, 10));
    expect(set.getIndexSet().toIndexArray()).toEqual(expectedSet.toIndexArray());
    expect(set.isLoading).toBeFalse();
  });

  test('clear() interrupts ongoing operation and resets set', async () => {
    // Arrange
    setupPostReturn(mockClient, 200, { items: [createNodeJson(10, 100)] });

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

function setupPostReturn(mockClient: Mock<CogniteClient>, status: number, ...bodies: any[]) {
  const filterNodesEndpointPath = /.*\/nodes\/list/;

  mockClient
    .setup(x =>
      x.post(
        It.Is<string>(url => filterNodesEndpointPath.test(url)),
        It.IsAny()
      )
    )
    .callback(async () => {
      const body = bodies[0];
      bodies.splice(0, 1);
      return {
        status,
        data: body,
        headers: {}
      };
    });
}
