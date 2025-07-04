import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { type Node3D } from '@cognite/sdk';
import { type DmsUniqueIdentifier } from '../data-providers/FdmSDK';
import { useReveal } from '../components/RevealCanvas/ViewerContext';
import { useFdmCadNodeCache } from '../components/CacheProvider/CacheProvider';

export const use3dNodeByExternalId = ({
  externalId,
  space
}: Partial<DmsUniqueIdentifier>): UseQueryResult<Node3D> => {
  const viewer = useReveal();
  const fdmNodeCache = useFdmCadNodeCache();

  return useQuery({
    queryKey: ['reveal', 'react-components', '3dNodeByExternalId', externalId, space],
    queryFn: async () => {
      if (externalId === undefined || space === undefined) {
        await Promise.reject(
          new Error(`No externalId and space provided to use3dNodeByExternalId hook`)
        );
        return;
      }

      const modelsRevisionIds = viewer.models.map((model) => ({
        modelId: model.modelId,
        revisionId: model.revisionId
      }));

      const modelMappings = (
        await fdmNodeCache.getMappingsForFdmInstances([{ externalId, space }], modelsRevisionIds)
      ).find((model) => model.mappings.size > 0);

      const node3d = modelMappings?.mappings.get(externalId)?.[0];

      if (node3d === undefined) {
        await Promise.reject(
          new Error(`Could not find a connected model to instance ${externalId} in space ${space}`)
        );
        return;
      }

      return node3d;
    }
  });
};
