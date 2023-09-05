/*!
 * Copyright 2023 Cognite AS
 */
import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { useFdmNodeCache } from '../components/NodeCacheProvider/NodeCacheProvider';
import { type DmsUniqueIdentifier, useReveal } from '../index';
import { type Node3D } from '@cognite/sdk';

export type Node3dData = {
  nodes: Node3D[];
  model: { modelId: number; revisionId: number };
};

export const useNode3dDataByExternalId = ({
  externalId,
  space
}: Partial<DmsUniqueIdentifier>): UseQueryResult<Node3dData> => {
  const viewer = useReveal();
  const fdmNodeCache = useFdmNodeCache();

  return useQuery(
    ['reveal', 'react-components', '3dNodeByExternalId', externalId, space],
    async () => {
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
        await fdmNodeCache.cache.getMappingsForFdmIds([{ externalId, space }], modelsRevisionIds)
      ).find((model) => model.mappings.size > 0);

      const nodes = modelMappings?.mappings.get(externalId);

      if (nodes === undefined || modelMappings === undefined) {
        await Promise.reject(
          new Error(`Could not find a connected model to instance ${externalId} in space ${space}`)
        );
        return;
      }

      return {
        nodes,
        model: { modelId: modelMappings.modelId, revisionId: modelMappings.revisionId }
      };
    }
  );
};
