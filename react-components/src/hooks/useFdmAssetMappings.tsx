/*!
 * Copyright 2023 Cognite AS
 */
import { useFdmSdk } from '../components/RevealContainer/SDKProvider';
import { useInfiniteQuery, useQuery, type UseInfiniteQueryResult, UseQueryResult } from '@tanstack/react-query';
import { type ThreeDModelMappings } from './types';
import { DEFAULT_QUERY_STALE_TIME } from '../utilities/constants';
import { type DmsUniqueIdentifier } from '../utilities/FdmSDK';
import { SYSTEM_3D_EDGE_SOURCE, type InModel3dEdgeProperties } from '../utilities/globalDataModels';
import { type TypedReveal3DModel } from '../components/Reveal3DResources/types';
import { createModelRevisionKey, ModelRevisionKey } from '../components/NodeCacheProvider/types';
import { CogniteExternalId, CogniteInternalId } from '@cognite/sdk/dist/src';
import { useSpecificMappings } from '../components/NodeCacheProvider/NodeCacheProvider';

/**
 * This hook fetches the list of FDM asset mappings for the given external ids
 */
export const useFdmAssetMappings = (
  fdmAssetExternalIds: DmsUniqueIdentifier[],
  models: TypedReveal3DModel[]
): UseQueryResult<ThreeDModelMappings[]> => {

  return useSpecificMappings(fdmAssetExternalIds,
                             models);

  /* return useQuery(
    ['reveal', 'react-components', fdmAssetExternalIds],
    async () => {
      console.log('Running infinite query for asset mappings');


      if (fdmAssetExternalIds.length === 0) return { items: [], nextCursor: undefined };
      const fdmAssetMappingFilter = {
        in: {
          property: ['edge', 'startNode'],
          values: fdmAssetExternalIds
        }
      };

      const instances = await fdmSdk.filterInstances<InModel3dEdgeProperties>(
        fdmAssetMappingFilter,
        'edge',
        SYSTEM_3D_EDGE_SOURCE,
        pageParam
      );

      const modelToMappings = new Map<ModelRevisionKey, ThreeDModelMappings>();

      instances.edges.forEach((instance) => {
        const { revisionId, revisionNodeId } = instance.properties;
        const modelId = models.find((model) => model.revisionId === revisionId)?.modelId;

        if (modelId === undefined) return;

        const modelRevisionKey = createModelRevisionKey(modelId, revisionId);

        const revisionMappings = modelToMappings.get(modelRevisionKey);

        if (revisionMappings === undefined) {
          const mappingsMap = new Map<CogniteExternalId, CogniteInternalId>();
          mappingsMap.set(instance.startNode.externalId, revisionNodeId);

          modelToMappings.set(modelRevisionKey, {
            modelId,
            revisionId,
            mappings: mappingsMap
          });
        } else {
          revisionMappings.mappings.set(instance.startNode.externalId, revisionNodeId);
        }
      });

      const revisionMappingsList = [...modelToMappings.values()];

      console.log('MappingsList = ', revisionMappingsList);

      return { items: revisionMappingsList, nextCursor: instances.nextCursor };
    },
    {
      staleTime: DEFAULT_QUERY_STALE_TIME,
      // getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: fdmAssetExternalIds.length > 0 && models.length > 0
    }
  ); */
};
