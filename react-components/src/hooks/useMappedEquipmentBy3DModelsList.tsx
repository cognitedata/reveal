/*!
 * Copyright 2023 Cognite AS
 */
import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { useFdmSdk } from '../components/RevealContainer/SDKProvider';
import { INSTANCE_SPACE_3D_DATA, SYSTEM_3D_EDGE_SOURCE } from '../utilities/constants';

export const useMappedEquipmentBy3DModelsList = (
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
            externalId: `model_3d_${modelId}`,
            space: INSTANCE_SPACE_3D_DATA
          }))
        }
      };

      const mappings = await fdmClient.filterAllInstances(filter, 'edge', SYSTEM_3D_EDGE_SOURCE);

      return mappings.edges.map((edge) => edge.startNode.externalId);
    },
    { staleTime: Infinity }
  );
};
