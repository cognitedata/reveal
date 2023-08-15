/*!
 * Copyright 2023 Cognite AS
 */

import { CogniteInternalId, type CogniteClient, type Node3D } from '@cognite/sdk';
import { DmsUniqueIdentifier, Source, type EdgeItem, type FdmSDK, InspectResultList } from '../../utilities/FdmSDK';
import {
  type FdmId,
  type FdmKey,
  type RevisionTreeIndex,
  createFdmKey,
  createRevisionTreeIndex,
  fdmKeyToId,
  insertIntoSetMap,
  TreeIndex
} from './NodeCache';

import { maxBy } from 'lodash';
import { type CogniteCadModel } from '@cognite/reveal';
import { INSTANCE_SPACE_3D_DATA, InModel3dEdgeProperties, SYSTEM_3D_EDGE_SOURCE } from '../../utilities/globalDataModels';

export type FdmNodeWithView = { fdmId: DmsUniqueIdentifier, view: Source };

type MappingsResponse = {
  results: Array<FdmId & { treeIndex: number }>;
  nextCursor: any | undefined;
};

export class RevisionNodeCache {
  private readonly _cogniteClient: CogniteClient;
  private readonly _fdmClient: FdmSDK;

  private readonly _modelId: number;
  private readonly _revisionId: number;

  /* private readonly _globalCdfToFdmMap: Map<
    RevisionTreeIndex, Array<EdgeItem<InModel3dEdgeProperties>>>;

  private readonly _treeIndexToNodeMap: Map<
  RevisionTreeIndex, FdmNodeWithView> = new Map(); */

  private readonly _treeIndexToFdmId: Map<
    TreeIndex, Array<EdgeItem<InModel3dEdgeProperties>>> = new Map();

  private readonly _treeIndexToFdmData: Map<
    TreeIndex, Array<FdmNodeWithView>> = new Map();

  constructor(
    cogniteClient: CogniteClient,
    fdmClient: FdmSDK,
    modelId: number,
    revisionId: number
  ) {
    this._cogniteClient = cogniteClient;
    this._fdmClient = fdmClient;

    this._modelId = modelId;
    this._revisionId = revisionId;
  }

  public async getClosestParentFdmData(searchTreeIndex: number): Promise<FdmNodeWithView[]> {

    let nodeEdges: EdgeItem<InModel3dEdgeProperties>[];
    let equallyMappedAncestors: Node3D[] = [];

    if (this._treeIndexToFdmData.has(searchTreeIndex)) {
      console.log('Cache hit in first cache during tree index lookup');
      return this._treeIndexToFdmData.get(searchTreeIndex)!;
    }

    if (this._treeIndexToFdmId.has(searchTreeIndex)) {
      nodeEdges = this._treeIndexToFdmId.get(searchTreeIndex)!;
      console.log('Cache hit in second cache during tree index lookup');
    } else {
      const { edges, lowestAncestors, firstMappedTreeIndex } =
        await this.getClosestParentExternalIds(searchTreeIndex);

      // If mapped parent exists in end-to-end-map...
      if (this._treeIndexToFdmData.has(firstMappedTreeIndex)) {
        // Fill treeIndex cache for all nodes on path
        lowestAncestors.forEach(a => {
          this._treeIndexToFdmData.set(a.treeIndex, this._treeIndexToFdmData.get(firstMappedTreeIndex)!);
        });

        // And return cached
        return this._treeIndexToFdmData.get(firstMappedTreeIndex)!;
      }

      nodeEdges = edges;
      equallyMappedAncestors = lowestAncestors;
    }

    const nodeInspectionResults = await inspectNodes(this._fdmClient, nodeEdges.map(edge => edge.startNode));

    const dataWithViews = nodeEdges.map((edge, ind) => ({ fdmId: edge.startNode,
                                                          view: nodeInspectionResults.items[ind].inspectionResults.involvedViewsAndContainers.views[0] }));

    equallyMappedAncestors.forEach(ancestor => this._treeIndexToFdmData.set(ancestor.treeIndex, dataWithViews));

    return dataWithViews;
  }

  private async getClosestParentExternalIds(
    treeIndex: number
  ): Promise<{ edges: Array<EdgeItem<InModel3dEdgeProperties>>; lowestAncestors: Node3D[]; firstMappedTreeIndex: number }> {
    const ancestors: Node3D[] = await fetchAncestorNodesForTreeIndex(
      this._modelId,
      this._revisionId,
      treeIndex,
      this._cogniteClient
    );

    const ancestorMappings: { edges: Array<EdgeItem<InModel3dEdgeProperties>> } =
      await getMappingEdges(
        this._modelId,
        this._revisionId,
        this._fdmClient,
        ancestors.map((a) => a.id)
      );

    if (ancestorMappings.edges.length === 0) {
      return { edges: [], lowestAncestors: [], firstMappedTreeIndex: 0 };
    }

    const mappings = ancestorMappings.edges.map((e) => ({
      edge: e,
      treeIndex: ancestors.find((a) => a.id === e.properties.revisionNodeId)!.treeIndex
    }));

    const firstMappedTreeIndex = maxBy(mappings, (mapping) => mapping.treeIndex)!.treeIndex;
    const resultsInLowerTree = mappings.filter((a) => a.treeIndex === firstMappedTreeIndex);

    return {
      edges: resultsInLowerTree.map(result => result.edge),
      lowestAncestors: ancestors.filter((a) => a.treeIndex >= firstMappedTreeIndex),
      firstMappedTreeIndex
    };
  }

  public insertTreeIndexMappings(treeIndex: TreeIndex, edge: EdgeItem<InModel3dEdgeProperties>): void {
    let edgeArray = this._treeIndexToFdmId.get(treeIndex);
    if (edgeArray === undefined) {
      this._treeIndexToFdmId.set(treeIndex, [edge]);
    } else {
      edgeArray.push(edge);
    }
  }

  public getAllEdges(): Array<EdgeItem<InModel3dEdgeProperties>> {
    return [...this._treeIndexToFdmId.values()].flat();
  }

  getIds(): { modelId: number; revisionId: number } {
    return {
      modelId: this._modelId,
      revisionId: this._revisionId
    };
  }
}

async function fetchAncestorNodesForTreeIndex(
  modelId: number,
  revisionId: number,
  treeIndex: number,
  cogniteClient: CogniteClient
): Promise<Node3D[]> {
  const nodeId = await treeIndexToNodeId(modelId, revisionId, treeIndex, cogniteClient);

  const ancestorNodes = await cogniteClient.revisions3D.list3DNodeAncestors(
    modelId,
    revisionId,
    nodeId
  );

  return ancestorNodes.items;
}


async function getMappingEdges(
  modelId: number,
  revisionId: number,
  fdmClient: FdmSDK,
  ancestorIds: CogniteInternalId[]
): Promise<{ edges: Array<EdgeItem<InModel3dEdgeProperties>> }> {
  const filter = {
    and: [
      {
        equals: {
          property: ['edge', 'endNode'],
          value: {
            space: INSTANCE_SPACE_3D_DATA,
            externalId: `${modelId}`
          }
        }
      },
      {
        equals: {
          property: [
            SYSTEM_3D_EDGE_SOURCE.space,
            `${SYSTEM_3D_EDGE_SOURCE.externalId}/${SYSTEM_3D_EDGE_SOURCE.version}`,
            'revisionId'
          ],
          value: revisionId
        }
      },
      {
        in: {
          property: [
            SYSTEM_3D_EDGE_SOURCE.space,
            `${SYSTEM_3D_EDGE_SOURCE.externalId}/${SYSTEM_3D_EDGE_SOURCE.version}`,
            'revisionNodeId'
          ],
          values: ancestorIds
        }
      }
    ]
  };

  return await fdmClient.filterAllInstances<InModel3dEdgeProperties>(
    filter,
    'edge',
    SYSTEM_3D_EDGE_SOURCE
  );
}

async function inspectNodes(
  fdmClient: FdmSDK,
  dataNodes: DmsUniqueIdentifier[]
): Promise<InspectResultList> {
  const inspectionResult = await fdmClient.inspectInstances({
    inspectionOperations: { involvedViewsAndContainers: {} },
    items: dataNodes.map(node => ({
        instanceType: 'node',
        externalId: node.externalId,
        space: node.space
    }))
  });

  return inspectionResult;
}


export async function treeIndexesToNodeIds(modelId: number, revisionId: number, treeIndexes: number[], cogniteClient: CogniteClient): Promise<number[]> {
    const outputsUrl = `${cogniteClient.getBaseUrl()}/api/v1/projects/${
      cogniteClient.project
    }/3d/models/${modelId}/revisions/${revisionId}/nodes/internalids/bytreeindices`;
  const response = await cogniteClient.post<{ items: number[] }>(outputsUrl, { data: { items: treeIndexes } });
    if (response.status === 200) {
      return response.data.items;
    } else {
      throw Error(`treeIndex-nodeId translation failed for treeIndexes ${treeIndexes}`);
    }
}

export async function nodeIdsToTreeIndexes(modelId: number, revisionId: number, nodeIds: number[], cogniteClient: CogniteClient): Promise<number[]> {
    const outputsUrl = `${cogniteClient.getBaseUrl()}/api/v1/projects/${
      cogniteClient.project
    }/3d/models/${modelId}/revisions/${revisionId}/nodes/treeindices/byinternalids`;
  const response = await cogniteClient.post<{ items: number[] }>(outputsUrl, { data: { items: nodeIds } });
    if (response.status === 200) {
      return response.data.items;
    } else {
      throw Error(`nodeId-treeIndex translation failed for nodeIds ${nodeIds}`);
    }
}
