/*!
 * Copyright 2023 Cognite AS
 */
import { type CogniteExternalId } from '@cognite/sdk';
import { useFdmSdk } from '../components/RevealContainer/SDKProvider';
import { useInfiniteQuery, type UseInfiniteQueryResult } from '@tanstack/react-query';
import {
  type Model3DEdgeProperties,
  type FdmAssetMappingsConfig,
  type ThreeDModelMappings
} from './types';
import { DEFAULT_QUERY_STALE_TIME } from '../utilities/constants';

/**
 * This hook fetches the list of FDM asset mappings for the given external ids
 */
export const useFdmAssetMappings = (
  fdmAssetExternalIds: CogniteExternalId[],
  fdmConfig?: FdmAssetMappingsConfig
): UseInfiniteQueryResult<{ items: ThreeDModelMappings[]; nextCursor: string }> => {
  const fdmSdk = useFdmSdk();

  return useInfiniteQuery(
    ['reveal', 'react-components', fdmAssetExternalIds],
    async ({ pageParam }) => {
      if (fdmAssetExternalIds?.length === 0) return { items: [], nextCursor: undefined };
      if (fdmConfig === undefined)
        throw Error('FDM config must be defined when using FDM asset mappings');

      const fdmAssetMappingFilter = {
        in: {
          property: ['edge', 'startNode'],
          values: fdmAssetExternalIds.map((externalId) => ({
            space: fdmConfig.assetFdmSpace,
            externalId
          }))
        }
      };

      const instances = await fdmSdk.filterInstances(
        fdmAssetMappingFilter,
        'edge',
        fdmConfig.source,
        pageParam
      );

      const modelMappingsTemp: ThreeDModelMappings[] = [];

      instances.edges.forEach((instance) => {
        const mappingProperty = instance.properties[fdmConfig.source.space][
          `${fdmConfig.source.externalId}/${fdmConfig.source.version}`
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
