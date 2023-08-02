/*!
 * Copyright 2023 Cognite AS
 */
import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { type FdmAssetMappingsConfig } from '..';
import { useFdmSdk } from '../components/RevealContainer/SDKProvider';

export const useMappedEquipmentBy3DModelsList = (
  Default3DFdmConfig: FdmAssetMappingsConfig,
  modelsList: Array<{ modelId: number; revisionId: number }> = []
): UseQueryResult<string[]> => {
  const fdmClient = useFdmSdk();

  return useQuery(
    ['reveal', 'react-components', ...modelsList],
    async () => {
      const filter = {
        in: {
          property: ['edge', 'endNode'],
          values: modelsList.map(({ modelId }) => ({
            space: Default3DFdmConfig.global3dSpace,
            externalId: `model_3d_${modelId}`
          }))
        }
      };

      let mappings = await fdmClient.filterInstances(filter, 'edge', Default3DFdmConfig.source);

      while (mappings.nextCursor !== undefined) {
        const nextMappings = await fdmClient.filterInstances(
          filter,
          'edge',
          Default3DFdmConfig.source,
          mappings.nextCursor
        );

        mappings = {
          edges: [...mappings.edges, ...nextMappings.edges],
          nextCursor: nextMappings.nextCursor
        };
      }

      return mappings.edges.map((edge) => edge.startNode.externalId);
    },
    { staleTime: Infinity }
  );
};
