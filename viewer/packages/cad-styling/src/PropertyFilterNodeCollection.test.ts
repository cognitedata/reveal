/*!
 * Copyright 2021 Cognite AS
 */

import { CogniteClient, Node3D, CursorAndAsyncIterator, CogniteAsyncIterator, ListResponse } from '@cognite/sdk';
import { IndexSet, NumericRange } from '@reveal/utilities';
import { PropertyFilterNodeCollection } from './PropertyFilterNodeCollection';
import { CdfModelNodeCollectionDataProvider } from './CdfModelNodeCollectionDataProvider';

import { Matrix4 } from 'three';

import { vi } from 'vitest';

describe(PropertyFilterNodeCollection.name, () => {
  let client: CogniteClient;
  let model: CdfModelNodeCollectionDataProvider;
  let set: PropertyFilterNodeCollection;

  beforeEach(() => {
    client = new CogniteClient({
      appId: 'test',
      project: 'dummy',
      getToken: async () => 'dummy'
    });

    model = {
      modelId: 112,
      revisionId: 113,
      getCdfToDefaultModelTransformation: () => new Matrix4(),
      getModelTransformation: () => new Matrix4()
    } as CdfModelNodeCollectionDataProvider;
    set = new PropertyFilterNodeCollection(client, model);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('isLoading is initially false', () => {
    expect(set.isLoading).toBeFalsy();
  });

  test('isLoading is true while executing request and false after', async () => {
    // Arrange
    mockList3DNodes(client, [[]]);

    // Act
    const promise = set.executeFilter({ PDMS: { ':capStatus': 'S9' } });

    // Assert
    expect(set.isLoading).toBeTruthy();
    await promise;
    expect(set.isLoading).toBeFalsy();
  });

  test('executeFilter() with empty result triggers change', async () => {
    // Arrange
    mockList3DNodes(client, [[]]);
    const listener = vi.fn();
    set.on('changed', listener);

    // Act
    await set.executeFilter({ PDMS: { ':capStatus': 'S9' } });

    // Assert
    expect(set.getIndexSet()).toEqual(new IndexSet());
    expect(listener).toHaveBeenCalled();
  });

  test('executeFilter() with single batch result, creates correct IndexSet', async () => {
    // Arrange
    mockList3DNodes(client, [[createNodeJson(10, 100), createNodeJson(110, 10)]]);

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
    mockList3DNodes(client, [
      [createNodeJson(1, 10), createNodeJson(20, 10)],
      [createNodeJson(30, 10), createNodeJson(50, 10)]
    ]);

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
    vi.spyOn(client.revisions3D, 'list3DNodes')
      .mockReturnValueOnce(buildListResponse([[createNodeJson(1, 10), createNodeJson(20, 10)]]))
      .mockReturnValueOnce(buildListResponse([[createNodeJson(30, 10), createNodeJson(50, 10)]]));

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
    expect(set.isLoading).toBeFalsy();
  });

  test('executeFilter() with two partitions, finishes and merges both', async () => {
    // Arrange
    set = new PropertyFilterNodeCollection(client, model, { requestPartitions: 2 });

    vi.spyOn(client.revisions3D, 'list3DNodes').mockImplementation((_modelId, _revisionId, params) => {
      if (params?.partition === '1/2') {
        return buildListResponse([[createNodeJson(1, 10)]]);
      }
      return buildListResponse([[createNodeJson(30, 10)]]);
    });

    // Act
    await set.executeFilter({ Foo: { Bar: 'value' } });

    // Assert
    const expectedSet = new IndexSet();
    expectedSet.addRange(new NumericRange(1, 10));
    expectedSet.addRange(new NumericRange(30, 10));
    expect(set.getIndexSet()).toEqual(expectedSet);
    expect(set.isLoading).toBeFalsy();
  });

  test('clear() interrupts ongoing operation and resets set', async () => {
    // Arrange
    mockList3DNodes(client, [[createNodeJson(10, 100)]]);

    // Act
    const executeFilterOperation = set.executeFilter({ PDMS: { ':capStatus': 'S9' } });
    set.clear();
    await executeFilterOperation;

    // Assert
    expect(set.isLoading).toBeFalsy();
    expect(set.getIndexSet()).toEqual(new IndexSet());
  });
});

function createNodeJson(treeIndex: number, subtreeSize: number): Node3D {
  return { id: treeIndex, treeIndex, parentId: 0, depth: 0, name: '', subtreeSize };
}

function buildListResponse(pages: Node3D[][]): CursorAndAsyncIterator<Node3D> {
  function makeListResponse(index: number): ListResponse<Node3D[]> {
    return {
      items: pages[index],
      next: index + 1 < pages.length ? () => Promise.resolve(makeListResponse(index + 1)) : undefined
    };
  }

  const promise = Promise.resolve(makeListResponse(0));

  const cogIter: CogniteAsyncIterator<Node3D> = {
    autoPagingEach: async () => {},
    autoPagingToArray: async () => pages.flat(),
    [Symbol.asyncIterator]() {
      return this;
    },
    async next() {
      return { done: true as const, value: undefined };
    }
  };

  return Object.assign(promise, cogIter);
}

function mockList3DNodes(client: CogniteClient, pages: Node3D[][]): void {
  vi.spyOn(client.revisions3D, 'list3DNodes').mockReturnValueOnce(buildListResponse(pages));
}
