/*!
 * Copyright 2023 Cognite AS
 */
import { type CogniteExternalId } from '@cognite/sdk';
import { useFdmSdk } from '../components/RevealContainer/SDKProvider';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { type FdmAssetMappingsConfig, type ThreeDModelMappings } from './types';

const DefaultFdmConfig: FdmAssetMappingsConfig = {
  source: {
    space: 'fdm-3d-test-savelii',
    version: '1',
    type: 'view',
    externalId: 'CDF_3D_Connection_Data'
  },
  assetFdmSpace: 'bark-corporation'
};

/**
 * This hook fetches the list of FDM asset mappings for the given external ids
 */
export const useFdmAssetMappings = (
  fdmAssetExternalIds: CogniteExternalId[],
  fdmConfig: FdmAssetMappingsConfig = DefaultFdmConfig
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
