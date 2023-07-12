/*!
 * Copyright 2023 Cognite AS
 */
import { type CogniteExternalId } from '@cognite/sdk';
import { useFdmSdk } from '../components/RevealContainer/SDKProvider';
import { type Source } from '../utilities/FdmSdk';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';

export type FdmAssetMappingsConfig = {
  source: Source;
  assetFdmSpace: string;
};

export type ThreeDModelMappings = {
  modelId: number;
  revisionId: number;
  mappings: Array<{ nodeId: number; externalId: string }>;
};

/**
 * This hook fetches the list of FDM asset mappings for the given external ids
 */
export const useFdmAssetMappings = (
  fdmAssetExternalIds: CogniteExternalId[],
  fdmConfig: FdmAssetMappingsConfig
): UseQueryResult<ThreeDModelMappings[]> => {
  const fdmSdk = useFdmSdk();

  const fdmAssetMappingFilter = {
    in: {
      property: ['edge', 'startNode'],
      values: fdmAssetExternalIds.map((externalId) => ({
        space: fdmConfig.assetFdmSpace,
        externalId
      }))
    }
  };

  return useQuery(
    ['reveal', 'react-components', fdmAssetExternalIds],
    async () => {
      if (fdmAssetExternalIds?.length === 0) return [];

      const instances = await fdmSdk.filterInstances(
        fdmAssetMappingFilter,
        'edge',
        fdmConfig.source
      );

      const modelMappingsTemp: ThreeDModelMappings[] = [];

      instances.edges.forEach((instance) => {
        const mappingProperty =
          instance.properties[fdmConfig.source.space][
            `${fdmConfig.source.externalId}/${fdmConfig.source.version}`
          ];

        const modelId = Number.parseInt(instance.endNode.externalId.slice(9));
        const revisionId = mappingProperty.RevisionId;

        const isAdded = modelMappingsTemp.some(
          (mapping) => mapping.modelId === modelId && mapping.revisionId === revisionId
        );

        if (!isAdded) {
          modelMappingsTemp.push({
            modelId,
            revisionId,
            mappings: [
              { nodeId: mappingProperty.NodeId, externalId: instance.startNode.externalId }
            ]
          });
        } else {
          const modelMapping = modelMappingsTemp.find(
            (mapping) => mapping.modelId === modelId && mapping.revisionId === revisionId
          );

          modelMapping?.mappings.push({
            nodeId: mappingProperty.NodeId,
            externalId: instance.startNode.externalId
          });
        }
      });

      return modelMappingsTemp;
    },
    { staleTime: 600000 }
  );
};
