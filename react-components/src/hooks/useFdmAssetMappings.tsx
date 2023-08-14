/*!
 * Copyright 2023 Cognite AS
 */
import { useFdmSdk } from '../components/RevealContainer/SDKProvider';
import { useInfiniteQuery, type UseInfiniteQueryResult } from '@tanstack/react-query';
import { type ThreeDModelMappings } from './types';
import { DEFAULT_QUERY_STALE_TIME } from '../utilities/constants';
import { type DmsUniqueIdentifier } from '../utilities/FdmSDK';
import { SYSTEM_3D_EDGE_SOURCE, type InModel3dEdgeProperties } from '../utilities/globalDataModels';
import { type TypedReveal3DModel } from '../components/Reveal3DResources/types';

/**
 * This hook fetches the list of FDM asset mappings for the given external ids
 */
export const useFdmAssetMappings = (
  fdmAssetExternalIds: DmsUniqueIdentifier[],
  models: TypedReveal3DModel[]
): UseInfiniteQueryResult<{ items: ThreeDModelMappings[]; nextCursor: string }> => {
  const fdmSdk = useFdmSdk();

  return useInfiniteQuery(
    ['reveal', 'react-components', fdmAssetExternalIds],
    async ({ pageParam }) => {
      if (fdmAssetExternalIds.length === 0) return { items: [], nextCursor: undefined };
      const fdmAssetMappingFilter = {
        in: {
          property: ['edge', 'startNode'],
          values: fdmAssetExternalIds.map(({ externalId, space }) => ({
            space,
            externalId
          }))
        }
      };

      const instances = await fdmSdk.filterInstances<InModel3dEdgeProperties>(
        fdmAssetMappingFilter,
        'edge',
        SYSTEM_3D_EDGE_SOURCE,
        pageParam
      );

      const modelMappingsTemp: ThreeDModelMappings[] = [];

      instances.edges.forEach((instance) => {
        const { revisionId, revisionNodeId } = instance.properties;
        const modelId = models.find((model) => model.revisionId === revisionId)?.modelId;

        if (modelId === undefined) return;

        const isAdded = modelMappingsTemp.some(
          (mapping) => mapping.modelId === modelId && mapping.revisionId === revisionId
        );

        if (!isAdded) {
          const mappingsMap = new Map<string, number>();
          mappingsMap.set(instance.startNode.externalId, revisionNodeId);

          modelMappingsTemp.push({
            modelId,
            revisionId,
            mappings: mappingsMap
          });
        } else {
          const modelMapping = modelMappingsTemp.find(
            (mapping) => mapping.modelId === modelId && mapping.revisionId === revisionId
          );

          modelMapping?.mappings.set(instance.startNode.externalId, revisionNodeId);
        }
      });

      return { items: modelMappingsTemp, nextCursor: instances.nextCursor };
    },
    {
      staleTime: DEFAULT_QUERY_STALE_TIME,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: fdmAssetExternalIds.length > 0 && models.length > 0
    }
  );
};
