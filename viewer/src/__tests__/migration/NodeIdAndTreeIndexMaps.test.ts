/*!
 * Copyright 2020 Cognite AS
 */

import { CogniteClient, InternalId } from '@cognite/sdk';
import { NodeIdAndTreeIndexMaps } from '@/public/migration/NodeIdAndTreeIndexMaps';

import { sleep } from '../wait';

jest.mock('@cognite/sdk');

describe('NodeIdAndTreeIndexMaps', () => {
  beforeAll(() => {
    // @ts-ignore
    CogniteClient.mockImplementation(() => {
      return {
        revisions3D: {
          retrieve3DNodes: async (_modelId: number, _revisionId: number, ids: InternalId[]) => {
            return ids.map((id: InternalId) => {
              return {
                id: id.id,
                treeIndex: -id.id
              };
            });
          }
        }
      };
    });
  });

  test('tree index is returned correctly', async () => {
    const client = new CogniteClient({ appId: 'test' });
    const maps = new NodeIdAndTreeIndexMaps(0, 0, client);
    const treeIndex1 = await maps.getTreeIndex(1);
    const treeIndex2 = await maps.getTreeIndex(2);
    expect(treeIndex1).toEqual(-1);
    expect(treeIndex2).toEqual(-2);
  });

  test('requesting same index twice returns correctly twice', async () => {
    const client = new CogniteClient({ appId: 'test' });
    const maps = new NodeIdAndTreeIndexMaps(0, 0, client);
    const treeIndex1 = await maps.getTreeIndex(1);
    const treeIndex2 = await maps.getTreeIndex(1);
    expect(treeIndex1).toEqual(-1);
    expect(treeIndex2).toEqual(-1);
  });

  test('requesting same index twice with sleep in-between returns correctly twice', async () => {
    const client = new CogniteClient({ appId: 'test' });
    const maps = new NodeIdAndTreeIndexMaps(0, 0, client);
    const treeIndex1 = await maps.getTreeIndex(1);
    await sleep(1000);
    const treeIndex2 = await maps.getTreeIndex(1);
    expect(treeIndex1).toEqual(-1);
    expect(treeIndex2).toEqual(-1);
  });

  test('getTreeIndices with cached IDs returns immediatly without network request', async () => {
    // Arrange
    const client = new CogniteClient({ appId: 'test' });
    const maps = new NodeIdAndTreeIndexMaps(0, 0, client);
    const spy = jest.spyOn(client.revisions3D, 'retrieve3DNodes');
    maps.add(1, 2);
    maps.add(3, 4);
    maps.add(5, 6);

    // Act
    const treeIndices = await maps.getTreeIndices([1, 3, 5]);

    // Assert
    expect(spy).not.toBeCalled();
    expect(treeIndices).toEqual([2, 4, 6]);
    spy.mockClear();
  });

  test('getTreeIndices without cached IDs fetches from network', async () => {
    const client = new CogniteClient({ appId: 'test' });
    const maps = new NodeIdAndTreeIndexMaps(0, 0, client);
    const spy = jest.spyOn(client.revisions3D, 'retrieve3DNodes');
    const treeIndices = await maps.getTreeIndices([1, 3, 5]);
    expect(spy).toBeCalledTimes(1);
    expect(treeIndices).toEqual([-1, -3, -5]);
    spy.mockClear();
  });

  test('getTreeIndices with partially cached IDs, fetches new values from the network', async () => {
    // Arrange
    const client = new CogniteClient({ appId: 'test' });
    const maps = new NodeIdAndTreeIndexMaps(0, 0, client);
    maps.add(3, 4);
    const spy = jest.spyOn(client.revisions3D, 'retrieve3DNodes');

    // Act
    const treeIndices = await maps.getTreeIndices([1, 3, 5]);

    // Assert
    expect(treeIndices).toEqual([-1, 4, -5]);
    expect(spy).toBeCalledTimes(1);
    spy.mockClear();
  });
});
