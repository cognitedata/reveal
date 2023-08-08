/*!
 * Copyright 2023 Cognite AS
 */
import { useFdmSdk } from '../components/RevealContainer/SDKProvider';
import { useInfiniteQuery, type UseInfiniteQueryResult } from '@tanstack/react-query';
import { type Model3DEdgeProperties, type ThreeDModelMappings } from './types';
import { DEFAULT_QUERY_STALE_TIME, SYSTEM_3D_EDGE_SOURCE } from '../utilities/constants';
import { type DmsUniqueIdentifier } from '../utilities/FdmSDK';

/**
 * This hook fetches the list of FDM asset mappings for the given external ids
 */
export const useFdmAssetMappings = (
  fdmAssetExternalIds: DmsUniqueIdentifier[]
): UseInfiniteQueryResult<{ items: ThreeDModelMappings[]; nextCursor: string }> => {
  const fdmSdk = useFdmSdk();

  return useInfiniteQuery(
    ['reveal', 'react-components', fdmAssetExternalIds],
    async ({ pageParam }) => {
      if (fdmAssetExternalIds?.length === 0) return { items: [], nextCursor: undefined };
      const fdmAssetMappingFilter = {
        in: {
          property: ['edge', 'startNode'],
          values: fdmAssetExternalIds.map(({ externalId, space }) => ({
            space,
            externalId
          }))
        }
      };

      const instances = await fdmSdk.filterInstances(
        fdmAssetMappingFilter,
        'edge',
        SYSTEM_3D_EDGE_SOURCE,
        pageParam
      );

      const modelMappingsTemp: ThreeDModelMappings[] = [];

      instances.edges.forEach((instance) => {
        const mappingProperty = instance.properties[SYSTEM_3D_EDGE_SOURCE.space][
          `${SYSTEM_3D_EDGE_SOURCE.externalId}/${SYSTEM_3D_EDGE_SOURCE.version}`
        ] as Model3DEdgeProperties;

        const modelId = Number.parseInt(instance.endNode.externalId.slice(9));
        const revisionId = mappingProperty.revisionId;

        const isAdded = modelMappingsTemp.some(
          (mapping) => mapping.modelId === modelId && mapping.revisionId === revisionId
        );

        if (!isAdded) {
          const mappingsMap = new Map<string, number>();
          mappingsMap.set(instance.startNode.externalId, mappingProperty.revisionNodeId);

          modelMappingsTemp.push({
            modelId,
            revisionId,
            mappings: mappingsMap
          });
        } else {
          const modelMapping = modelMappingsTemp.find(
            (mapping) => mapping.modelId === modelId && mapping.revisionId === revisionId
          );

          modelMapping?.mappings.set(instance.startNode.externalId, mappingProperty.revisionNodeId);
        }
      });

      return { items: modelMappingsTemp, nextCursor: instances.nextCursor };
    },
    {
      staleTime: DEFAULT_QUERY_STALE_TIME,
      getNextPageParam: (lastPage) => lastPage.nextCursor
    }
  );
};
