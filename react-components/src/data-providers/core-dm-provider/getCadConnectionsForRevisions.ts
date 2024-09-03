/*!
 * Copyright 2024 Cognite AS
 */
import { type FdmCadConnection, type FdmKey } from '../../components/CacheProvider/types';
import { type NodeItem, type DmsUniqueIdentifier, type FdmSDK } from '../FdmSDK';
import {
  type COGNITE_ASSET_SOURCE,
  COGNITE_ASSET_VIEW_VERSION_KEY,
  type COGNITE_CAD_NODE_SOURCE,
  COGNITE_CAD_NODE_VIEW_VERSION_KEY,
  type CogniteAssetProperties,
  type CogniteCADNodeProperties,
  CORE_DM_SPACE
} from './dataModels';
import { getModelIdFromExternalId, getRevisionIdFromExternalId } from './getCdfIdFromExternalId';
import { createFdmKey } from '../../components/CacheProvider/idAndKeyTranslation';
import { type PromiseType } from '../utils/typeUtils';
import { isDefined } from '../../utilities/isDefined';
import { type QueryResult } from '../utils/queryNodesAndEdges';
import { restrictToDmsId } from './restrictToDmsId';
import { cadConnectionsQuery } from './cadConnectionsQuery';

export async function getCadConnectionsForRevisions(
  modelRevisions: Array<[DmsUniqueIdentifier, DmsUniqueIdentifier]>,
  fdmSdk: FdmSDK
): Promise<FdmCadConnection[]> {
  const results = await getModelConnectionResults(modelRevisions, fdmSdk);
  const object3dToAssetMap = createObject3dToAssetMap(results.items.assets);
  const cadNodeToModelMap = createCadNodeToObject3dMap(results.items.cad_nodes);

  const returnResult = results.items.cad_nodes
    .map((cadNode) => {
      const props = cadNode.properties[CORE_DM_SPACE][COGNITE_CAD_NODE_VIEW_VERSION_KEY];
      const object3dKey = cadNodeToModelMap.get(createFdmKey(cadNode));

      if (object3dKey === undefined) {
        return undefined;
      }

      const connectedAsset = object3dToAssetMap.get(object3dKey);

      if (connectedAsset === undefined) {
        return undefined;
      }

      const modelIdRevisionIdTreeIndex = getModelAndTreeIndex(modelRevisions, props);

      if (modelIdRevisionIdTreeIndex === undefined) {
        return undefined;
      }

      return {
        ...modelIdRevisionIdTreeIndex,
        instance: restrictToDmsId(connectedAsset)
      };
    })
    .filter(isDefined);

  return returnResult;
}

function createObject3dToAssetMap<T extends NodeItem<CogniteAssetProperties>>(
  assets: T[]
): Map<FdmKey, T> {
  return new Map(
    assets.map((asset) => [
      createFdmKey(asset.properties[CORE_DM_SPACE]?.[COGNITE_ASSET_VIEW_VERSION_KEY].object3D),
      asset
    ])
  );
}

function createCadNodeToObject3dMap(
  cadNodes: PromiseType<ReturnType<typeof getModelConnectionResults>>['items']['cad_nodes']
): Map<FdmKey, FdmKey> {
  return new Map(
    cadNodes.map((cadNode) => [
      createFdmKey(cadNode),
      createFdmKey(cadNode.properties[CORE_DM_SPACE][COGNITE_CAD_NODE_VIEW_VERSION_KEY].object3D)
    ])
  );
}

function getModelAndTreeIndex(
  modelRevisions: Array<[DmsUniqueIdentifier, DmsUniqueIdentifier]>,
  cadNodeProps: CogniteCADNodeProperties
): { modelId: number; revisionId: number; treeIndex: number } | undefined {
  const modelRevisionPair = modelRevisions.find(
    ([modelRef, _revisionRef]) =>
      cadNodeProps.model3D.externalId === modelRef.externalId &&
      cadNodeProps.model3D.space === modelRef.space
  );

  if (modelRevisionPair === undefined) {
    return undefined;
  }

  const revisionIndex = cadNodeProps.revisions.findIndex(
    (propRevision) =>
      modelRevisionPair[1].externalId === propRevision.externalId &&
      modelRevisionPair[1].space === propRevision.space
  );

  if (revisionIndex === -1) {
    return undefined;
  }

  const modelId = getModelIdFromExternalId(cadNodeProps.model3D.externalId);
  const revisionId = getRevisionIdFromExternalId(cadNodeProps.revisions[revisionIndex].externalId);
  const treeIndex = cadNodeProps.treeIndexes[revisionIndex];

  return { modelId, revisionId, treeIndex };
}

type SourcesSelectType = [
  { source: typeof COGNITE_CAD_NODE_SOURCE; properties: CogniteCADNodeProperties },
  { source: typeof COGNITE_ASSET_SOURCE; properties: CogniteAssetProperties }
];

async function getModelConnectionResults(
  modelRevisions: Array<[DmsUniqueIdentifier, DmsUniqueIdentifier]>,
  fdmSdk: FdmSDK
): Promise<QueryResult<typeof cadConnectionsQuery, SourcesSelectType>> {
  const parameters = {
    modelRefs: modelRevisions.map(([modelRef, _revisionRef]) => restrictToDmsId(modelRef)),
    revisionRefs: modelRevisions.map(([_modelRef, revisionRef]) => restrictToDmsId(revisionRef))
  };

  const query = {
    ...cadConnectionsQuery,
    parameters
  };

  return await fdmSdk.queryAllNodesAndEdges<typeof query, SourcesSelectType>(query);
}
