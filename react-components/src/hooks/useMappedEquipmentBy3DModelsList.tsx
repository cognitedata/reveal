/*!
 * Copyright 2023 Cognite AS
 */
import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { useFdmSdk } from '../components/RevealContainer/SDKProvider';
import {
  type InModel3dEdgeProperties,
  SYSTEM_3D_EDGE_SOURCE,
  SYSTEM_SPACE_3D_SCHEMA
} from '../utilities/globalDataModels';
import { type FdmSDK, type EdgeItem } from '../utilities/FdmSDK';

export type ModelRevisionId = `${number}-${number}`;
export type ModelRevisionToEdgeMap = Map<ModelRevisionId, Array<EdgeItem<InModel3dEdgeProperties>>>;

export const useMappedEquipmentByRevisionList = (
  modelRevisionIds: Array<{ modelId: number; revisionId: number }>,
  enabled = true
): UseQueryResult<ModelRevisionToEdgeMap> => {
  const fdmClient = useFdmSdk();
  return useQuery(
    [
      'reveal',
      'react-components',
      ...modelRevisionIds.map((modelRevisionId) => modelRevisionId.revisionId.toString()).sort()
    ],
    async () => {
      const revisionIds = modelRevisionIds.map((modelRevisionId) => modelRevisionId.revisionId);
      const edges = await getEdgesForRevisions(revisionIds, fdmClient);
      const groupToModels = groupToModelRevision(edges, modelRevisionIds);
      return groupToModels;
    },
    { staleTime: Infinity, enabled: enabled && modelRevisionIds.length > 0 }
  );
};

function groupToModelRevision(
  edges: Array<EdgeItem<InModel3dEdgeProperties>>,
  modelRevisionIds: Array<{ modelId: number; revisionId: number }>
): Map<string, Array<EdgeItem<InModel3dEdgeProperties>>> {
  return edges.reduce((map, edge) => {
    const edgeRevisionId = edge.properties.revisionId;
    const modelRevisionId = modelRevisionIds.find((p) => p.revisionId === edgeRevisionId);
    if (modelRevisionId === undefined) return map;
    const modelRevisionIdKey: ModelRevisionId = `${modelRevisionId.modelId}-${modelRevisionId.revisionId}`;
    const edgesForModel = map.get(modelRevisionIdKey);
    if (edgesForModel === undefined) {
      map.set(modelRevisionIdKey, [edge]);
      return map;
    }
    edgesForModel.push(edge);

    return map;
  }, new Map<ModelRevisionId, Array<EdgeItem<InModel3dEdgeProperties>>>());
}

async function getEdgesForRevisions(
  revisionIds: number[],
  fdmClient: FdmSDK
): Promise<Array<EdgeItem<InModel3dEdgeProperties>>> {
  const versionedPropertiesKey = `${SYSTEM_3D_EDGE_SOURCE.externalId}/${SYSTEM_3D_EDGE_SOURCE.version}`;
  const filter = {
    in: {
      property: [SYSTEM_SPACE_3D_SCHEMA, versionedPropertiesKey, 'revisionId'],
      values: revisionIds
    }
  };
  const mappings = await fdmClient.filterAllInstances<InModel3dEdgeProperties>(
    filter,
    'edge',
    SYSTEM_3D_EDGE_SOURCE
  );
  return mappings.edges;
}
