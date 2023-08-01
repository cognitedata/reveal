/*!
 * Copyright 2023 Cognite AS
 */
import { type CogniteExternalId } from '@cognite/sdk';
import { useFdmSdk } from '../components/RevealContainer/SDKProvider';
import { type UseQueryResult, useQuery, useInfiniteQuery, type UseInfiniteQueryResult } from '@tanstack/react-query';
import { type FdmAssetMappingsConfig, type ThreeDModelMappings } from './types';
import { DEFAULT_QUERY_STALE_TIME } from '../utilities/constants';

/**
 * This hook fetches the list of FDM asset mappings for the given external ids
 */
export const useFdmAssetMappings = (
  fdmAssetExternalIds: CogniteExternalId[],
  fdmConfig?: FdmAssetMappingsConfig
): UseInfiniteQueryResult<{ items: ThreeDModelMappings[], nextCursor: string }> => {
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
        const mappingProperty =
          instance.properties[fdmConfig.source.space][
            `${fdmConfig.source.externalId}/${fdmConfig.source.version}`
          ];

        const modelId = Number.parseInt(instance.endNode.externalId.slice(9));
        const revisionId = mappingProperty.revisionId;

        const isAdded = modelMappingsTemp.some(
          (mapping) => mapping.modelId === modelId && mapping.revisionId === revisionId
        );

        if (!isAdded) {
          modelMappingsTemp.push({
            modelId,
            revisionId,
            mappings: [
              { nodeId: mappingProperty.revisionNodeId, externalId: instance.startNode.externalId }
            ]
          });
        } else {
          const modelMapping = modelMappingsTemp.find(
            (mapping) => mapping.modelId === modelId && mapping.revisionId === revisionId
          );

          modelMapping?.mappings.push({
            nodeId: mappingProperty.revisionNodeId,
            externalId: instance.startNode.externalId
          });
        }
      });

      return { items: modelMappingsTemp, nextCursor: instances.nextCursor };
    },
    {
      staleTime: DEFAULT_QUERY_STALE_TIME,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
};
