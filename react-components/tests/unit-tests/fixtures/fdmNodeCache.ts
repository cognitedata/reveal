import { Mock } from 'moq.ts';
import { type FdmNodeCache } from '../../../src/components/CacheProvider/FdmNodeCache';
import { type FdmNodeCacheContent } from '../../../src/components/CacheProvider/NodeCacheProvider';
import { type DmsUniqueIdentifier } from '../../../src/data-providers/FdmSDK';
import { type TypedReveal3DModel } from '../../../src/components/Reveal3DResources/types';

const fdmNodeCacheMock = new Mock<FdmNodeCache>()
  .setup((instance) => instance.getAllMappingExternalIds)
  .returns(
    async (
      modelRevisionIds: Array<{ modelId: number; revisionId: number }>,
      _fetchViews: boolean
    ) => {
      return new Map(
        modelRevisionIds.map(({ modelId, revisionId }) => [
          `${modelId}-${revisionId}`,
          [`externalId-${modelId}/${revisionId}`]
        ])
      );
    }
  )
  .setup((instance) => instance.getClosestParentDataPromises)
  .returns(async (modelId: number, revisionId: number, treeIndex: number) => {
    return {
      modelId,
      revisionId,
      treeIndex,
      data: `data-for-${modelId}-${revisionId}-${treeIndex}`
    };
  })
  .setup((instance) => instance.getMappingsForFdmInstances)
  .returns(async (fdmAssetExternalIds: DmsUniqueIdentifier[], models: TypedReveal3DModel[]) => {
    return models.map((model) => ({
      modelId: model.modelId,
      revisionId: model.revisionId,
      mappings: new Map(
        fdmAssetExternalIds.map((id) => [
          id,
          `mapping-for-${JSON.stringify(id)}-${model.modelId}-${model.revisionId}`
        ])
      )
    }));
  });

const fdmNodeCacheContentMock: FdmNodeCacheContent = {
  cache: fdmNodeCacheMock.object()
};

export { fdmNodeCacheContentMock };
