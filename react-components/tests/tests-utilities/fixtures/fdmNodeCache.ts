import { Mock } from 'moq.ts';
import { type FdmCadNodeCache } from '../../../src/components/CacheProvider/cad/FdmCadNodeCache';
import { type Node3D } from '@cognite/sdk';
import {
  type ModelRevisionId,
  type FdmCadConnection,
  type FdmConnectionWithNode
} from '../../../src/components/CacheProvider/types';
import { type DmsUniqueIdentifier } from '../../../src/data-providers';
import { createCadNodeMock } from './cadNode';
import { createFdmKey } from '../../../src/components/CacheProvider';

const fdmCadNodeCacheMock = new Mock<FdmCadNodeCache>()
  .setup((instance) => instance.getAllMappingExternalIds.bind(instance))
  .returns(
    async (
      modelRevisionIds: Array<{ modelId: number; revisionId: number }>,
      _fetchViews: boolean
    ) => {
      return new Map(
        modelRevisionIds.map(({ modelId, revisionId }) => [
          `${modelId}/${revisionId}`,
          [
            {
              connection: {
                instance: { space: 'space', externalId: 'id' },
                modelId,
                revisionId,
                treeIndex: 1
              } satisfies FdmCadConnection,
              cadNode: createCadNodeMock()
            } satisfies FdmConnectionWithNode
          ]
        ])
      );
    }
  )
  .setup((instance) => instance.getClosestParentDataPromises.bind(instance))
  .returns((modelId: number, revisionId: number, treeIndex: number) => {
    return {
      modelId,
      revisionId,
      treeIndex,
      data: `data-for-${modelId}-${revisionId}-${treeIndex}`,
      cadAndFdmNodesPromise: Promise.resolve(undefined),
      viewsPromise: Promise.resolve([])
    };
  })
  .setup((instance) => instance.getMappingsForFdmInstances.bind(instance))
  .returns(
    async (fdmAssetExternalIds: DmsUniqueIdentifier[], modelRevisionIds: ModelRevisionId[]) => {
      return modelRevisionIds.map((model) => ({
        modelId: model.modelId,
        revisionId: model.revisionId,
        mappings: new Map(fdmAssetExternalIds.map((id) => [createFdmKey(id), [] as Node3D[]]))
      }));
    }
  );

const fdmNodeCacheContentMock = fdmCadNodeCacheMock.object();

export { fdmNodeCacheContentMock };
