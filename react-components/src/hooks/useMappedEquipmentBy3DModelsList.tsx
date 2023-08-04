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
    ['reveal', 'react-components', ...modelsList.map(({ modelId }) => modelId.toString()).sort()],
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

      const mappings = await fdmClient.filterAllInstances(
        filter,
        'edge',
        Default3DFdmConfig.source
      );

      return mappings.edges.map((edge) => edge.startNode.externalId);
    },
    { staleTime: Infinity }
  );
};
