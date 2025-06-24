import { describe, expect, it, beforeEach, test, vi } from 'vitest';
import { CoreDm3dFdm3dDataProvider } from './CoreDm3dDataProvider';
import { Mock, It, type IMock } from 'moq.ts';
import { NodeItem, type FdmSDK } from '../FdmSDK';
import { restrictToDmsId } from '../../utilities/restrictToDmsId';
import { type AddImage360CollectionDatamodelsOptions } from '../../components';
import {
  modelInstanceFixture0,
  revisionInstanceFixture0
} from '#test-utils/fixtures/dm/model3dData';
import { isEqual } from 'lodash';
import {
  COGNITE_3D_MODEL_SOURCE,
  COGNITE_3D_REVISION_SOURCE,
  CORE_DM_3D_CONTAINER_SPACE
} from './dataModels';
import { QueryRequest, QueryResponse } from '@cognite/sdk';
import { QueryResult, SelectSourceWithParams } from '../utils/queryNodesAndEdges';
import { createDmsNodeItem } from '#test-utils/dms/createDmsNodeItem';

const image360CollectionId: AddImage360CollectionDatamodelsOptions = {
  externalId: 'image360Collection0',
  space: 'space0',
  source: 'cdm'
};

const modelId0 = 1234;
const revisionId0 = 5678;

describe(CoreDm3dFdm3dDataProvider.name, () => {
  let fdmSdkMock: IMock<FdmSDK>;

  beforeEach(() => {
    vi.resetAllMocks();
    fdmSdkMock = createFdmSdkMock();
  });

  describe('getDMSModels', () => {
    it('should fetch model ref for classic input model options', async () => {
      const coreDmProvider = new CoreDm3dFdm3dDataProvider(fdmSdkMock.object());

      const result = await coreDmProvider.getDMSModels(modelId0);

      expect(result).toEqual([restrictToDmsId(modelInstanceFixture0)]);
    });
  });

  describe('getRevisionRefs', () => {
    it('should fetch revision ref for classic input model options', async () => {
      const coreDmProvider = new CoreDm3dFdm3dDataProvider(fdmSdkMock.object());

      const result = await coreDmProvider.getRevisionRefs([
        { modelId: modelId0, revisionId: revisionId0 }
      ]);

      expect(result).toEqual([restrictToDmsId(revisionInstanceFixture0)]);
    });

    it('should return the input ID when input is CoreDM image360 options', async () => {
      const coreDmProvider = new CoreDm3dFdm3dDataProvider(fdmSdkMock.object());

      const result = await coreDmProvider.getRevisionRefs([image360CollectionId]);

      expect(result).toEqual([restrictToDmsId(image360CollectionId)]);
    });
  });

  describe('getCadConnectionsForRevisions', () => {
    const mockQueryNodesAndEdges =
      vi.fn<(request: QueryRequest) => Promise<QueryResult<any, any>>>();
    const mockQueryAllNodesAndEdges =
      vi.fn<(request: QueryRequest, cursors: string[]) => Promise<QueryResult<any, any>>>();

    const TEST_MODEL_ID = 123;
    const TEST_REVISION_ID = 234;
    const TEST_TREE_INDEX = 987;

    const TEST_MODEL_INSTANCE = {
      externalId: `cog_3d_model_${TEST_MODEL_ID}`,
      space: 'model-space'
    };
    const TEST_REVISION_INSTANCE = {
      externalId: `cog_3d_revision_${TEST_REVISION_ID}`,
      space: 'revision-space'
    };
    const TEST_ASSET_INSTANCE = {
      externalId: 'asset-id',
      space: 'asset-space'
    };

    const TEST_OBJECT_3D_ID = { externalId: 'object3d-id', space: 'object3d-space' };

    beforeEach(() => {
      fdmSdkMock
        .setup((p) => p.queryNodesAndEdges)
        .returns(mockQueryNodesAndEdges)
        .setup((p) => p.queryAllNodesAndEdges)
        .returns(mockQueryAllNodesAndEdges);

      mockQueryNodesAndEdges
        // getDMSModels
        .mockResolvedValueOnce({
          items: {
            models: [
              createDmsNodeItem({
                id: TEST_MODEL_INSTANCE
              })
            ]
          }
        })
        // getDMSRevision
        .mockResolvedValueOnce({
          items: {
            revision: [
              createDmsNodeItem({
                id: TEST_REVISION_INSTANCE
              })
            ]
          }
        });

      mockQueryAllNodesAndEdges
        // getCadConnectionsForRevisiions
        .mockResolvedValueOnce({
          items: {
            assets: [
              createDmsNodeItem({
                id: TEST_ASSET_INSTANCE,
                properties: { cdf_cdm: { 'CogniteAsset/v1': { object3D: TEST_OBJECT_3D_ID } } }
              })
            ],
            cad_nodes: [
              createDmsNodeItem({
                id: {
                  externalId: 'cad-node-id',
                  space: 'cad-node-space'
                },
                properties: {
                  cdf_cdm: {
                    'CogniteCADNode/v1': {
                      object3D: TEST_OBJECT_3D_ID,
                      model3D: TEST_MODEL_INSTANCE,
                      revisions: [TEST_REVISION_INSTANCE],
                      treeIndexes: [TEST_TREE_INDEX]
                    }
                  }
                }
              })
            ]
          }
        });
    });

    test('returns empty array for empty input', async () => {
      const coreDmProvider = new CoreDm3dFdm3dDataProvider(fdmSdkMock.object());
      const result = await coreDmProvider.getCadConnectionsForRevisions([]);

      expect(result).toEqual([]);
    });

    test('returns correct result for single CAD model', async () => {
      const coreDmProvider = new CoreDm3dFdm3dDataProvider(fdmSdkMock.object());
      const result = await coreDmProvider.getCadConnectionsForRevisions([
        { modelId: TEST_MODEL_ID, revisionId: TEST_REVISION_ID }
      ]);

      expect(mockQueryNodesAndEdges).toHaveBeenCalledTimes(2);
      expect(mockQueryAllNodesAndEdges).toHaveBeenCalledTimes(1);
      expect(result).toEqual([
        {
          instance: TEST_ASSET_INSTANCE,
          modelId: TEST_MODEL_ID,
          revisionId: TEST_REVISION_ID,
          treeIndex: TEST_TREE_INDEX
        }
      ]);
    });

    test('should ignore models with modelIdentifier+revisionIdentifier equal to zero (like DM pointclouds)', async () => {
      const coreDmProvider = new CoreDm3dFdm3dDataProvider(fdmSdkMock.object());
      const result = await coreDmProvider.getCadConnectionsForRevisions([
        { modelId: TEST_MODEL_ID, revisionId: TEST_REVISION_ID },
        {
          modelId: 0,
          revisionId: 0
        }
      ]);

      expect(mockQueryNodesAndEdges).toHaveBeenCalledTimes(2);
      expect(mockQueryAllNodesAndEdges).toHaveBeenCalledTimes(1);
      expect(result).toEqual([
        {
          instance: TEST_ASSET_INSTANCE,
          modelId: TEST_MODEL_ID,
          revisionId: TEST_REVISION_ID,
          treeIndex: TEST_TREE_INDEX
        }
      ]);
    });
  });
});

function createFdmSdkMock(): IMock<FdmSDK> {
  return new Mock<FdmSDK>()
    .setup(
      async (p) =>
        await p.queryNodesAndEdges(
          It.Is(
            (query) =>
              (query as any).with?.models?.nodes?.filter?.and?.[0]?.equals?.value ===
              `cog_3d_model_${modelId0}`
          )
        )
    )
    .returns(Promise.resolve({ items: { models: [modelInstanceFixture0] } }))
    .setup(
      async (p) =>
        await p.queryNodesAndEdges(
          It.Is(
            (query) =>
              (query as any).parameters?.revisionExternalId === `cog_3d_revision_${revisionId0}`
          )
        )
    )
    .returns(Promise.resolve({ items: { revision: [revisionInstanceFixture0] } }));
}
