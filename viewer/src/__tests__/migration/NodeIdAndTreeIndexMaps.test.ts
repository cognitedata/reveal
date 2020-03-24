/*!
 * Copyright 2020 Cognite AS
 */

import { CogniteClient, InternalId } from '@cognite/sdk';
import { NodeIdAndTreeIndexMaps } from '../../migration/NodeIdAndTreeIndexMaps';

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
                id,
                treeIndex: id.id
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
    expect(treeIndex1).toEqual(1);
    expect(treeIndex2).toEqual(2);
  });
});
