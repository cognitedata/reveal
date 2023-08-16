/*!
 * Copyright 2023 Cognite AS
 */

import { CogniteInternalId, type CogniteClient, type Node3D } from '@cognite/sdk';
import { DmsUniqueIdentifier, Source, type EdgeItem, type FdmSDK, InspectResultList } from '../../utilities/FdmSDK';
import {
  TreeIndex
} from './NodeCache';

import { maxBy } from 'lodash';
import { type CogniteCadModel } from '@cognite/reveal';
import { INSTANCE_SPACE_3D_DATA, InModel3dEdgeProperties, SYSTEM_3D_EDGE_SOURCE } from '../../utilities/globalDataModels';

export type Fdm3dNodeData = { fdmId: DmsUniqueIdentifier, view: Source, cadNode: Node3D };
export type FdmCadEdge = EdgeItem<InModel3dEdgeProperties>;
export type FdmEdgeWithNode = { edge: FdmCadEdge, node: Node3D };

export class RevisionNodeCache {
  private readonly _cogniteClient: CogniteClient;
  private readonly _fdmClient: FdmSDK;

  private readonly _modelId: number;
  private readonly _revisionId: number;

  private readonly _treeIndexToFdmId: Map<
    TreeIndex, Array<FdmEdgeWithNode>> = new Map();

  private readonly _treeIndexToFdmData: Map<
    TreeIndex, Array<Fdm3dNodeData>> = new Map();

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

  public async getClosestParentFdmData(searchTreeIndex: number): Promise<Fdm3dNodeData[]> {

    if (this._treeIndexToFdmData.has(searchTreeIndex)) {
      console.log('Cache hit in first cache during tree index lookup');
      return this._treeIndexToFdmData.get(searchTreeIndex)!;
    }

    if (this._treeIndexToFdmId.has(searchTreeIndex)) {
      const nodeEdges = this._treeIndexToFdmId.get(searchTreeIndex)!;
      console.log('Cache hit in second cache during tree index lookup');

      return this.getDataWithViewsForFdmStartNodes(nodeEdges, []);
    }

    return this.findNodeDataFromAncestors(searchTreeIndex);
  }

  private async findNodeDataFromAncestors(treeIndex: TreeIndex): Promise<Fdm3dNodeData[]> {

    const { edges, ancestorsWithSameMapping, firstMappedAncestorTreeIndex } =
      await this.getClosestParentMapping(treeIndex);

    if (this._treeIndexToFdmData.has(firstMappedAncestorTreeIndex)) {
      const fdmData = this._treeIndexToFdmData.get(firstMappedAncestorTreeIndex)!
      this.setCacheForNodes(ancestorsWithSameMapping, fdmData);

      return fdmData;
    }

    const firstMappedAncestor = ancestorsWithSameMapping.find(a => a.treeIndex === firstMappedAncestorTreeIndex)!;

    const nodeEdges = edges.map(e => ({ edge: e, node: firstMappedAncestor }));

    return this.getDataWithViewsForFdmStartNodes(nodeEdges, ancestorsWithSameMapping);
  }

  private setCacheForNodes(nodes: Node3D[], nodeData: Fdm3dNodeData[]): void {
    nodes.forEach(n => {
        this._treeIndexToFdmData.set(n.treeIndex, nodeData);
      });
  }

  private async getDataWithViewsForFdmStartNodes(nodeEdges: FdmEdgeWithNode[], ancestorsWithSameMapping: Node3D[]): Promise<Fdm3dNodeData[]> {
    const nodeInspectionResults = await inspectNodes(this._fdmClient, nodeEdges.map(edge => edge.edge.startNode));
    console.log('Inspection results = ', nodeInspectionResults);

    const dataWithViews = nodeEdges.map((fdmEdgeWithNode, ind) => ({
      fdmId: fdmEdgeWithNode.edge.startNode,
      view: nodeInspectionResults.items[ind].inspectionResults.involvedViewsAndContainers.views[0],
      cadNode: fdmEdgeWithNode.node
    }));

    ancestorsWithSameMapping.forEach(ancestor => this._treeIndexToFdmData.set(ancestor.treeIndex, dataWithViews));

    console.log('Data with views = ', dataWithViews);
    return dataWithViews;
  }

  private async getClosestParentMapping(
    treeIndex: number
  ): Promise<{ edges: Array<FdmCadEdge>; ancestorsWithSameMapping: Node3D[]; firstMappedAncestorTreeIndex: number }> {
    const ancestors: Node3D[] = await fetchAncestorNodesForTreeIndex(
      this._modelId,
      this._revisionId,
      treeIndex,
      this._cogniteClient
    );

    const ancestorMappings =
      await getMappingEdges(
        this._modelId,
        this._revisionId,
        this._fdmClient,
        ancestors.map((a) => a.id)
      );

    if (ancestorMappings.edges.length === 0) {
      return { edges: [], ancestorsWithSameMapping: [], firstMappedAncestorTreeIndex: 0 };
    }

    const mappings = ancestorMappings.edges.map((e) => ({
      edge: e,
      treeIndex: ancestors.find((a) => a.id === e.properties.revisionNodeId)!.treeIndex
    }));

    const firstMappedAncestorTreeIndex = maxBy(mappings, (mapping) => mapping.treeIndex)!.treeIndex;
    const resultsInLowerTree = mappings.filter((a) => a.treeIndex === firstMappedAncestorTreeIndex);

    return {
      edges: resultsInLowerTree.map(result => result.edge),
      ancestorsWithSameMapping: ancestors.filter((a) => a.treeIndex >= firstMappedAncestorTreeIndex),
      firstMappedAncestorTreeIndex
    };
  }

  public insertTreeIndexMappings(treeIndex: TreeIndex, edge: FdmEdgeWithNode): void {
    let edgeArray = this._treeIndexToFdmId.get(treeIndex);
    if (edgeArray === undefined) {
      this._treeIndexToFdmId.set(treeIndex, [edge]);
    } else {
      edgeArray.push(edge);
    }
  }

  public getAllEdges(): Array<FdmEdgeWithNode> {
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
  const nodeId = await treeIndexesToNodeIds(modelId, revisionId, [treeIndex], cogniteClient);

  const ancestorNodes = await cogniteClient.revisions3D.list3DNodeAncestors(
    modelId,
    revisionId,
    nodeId[0]
  );

  return ancestorNodes.items;
}

async function getMappingEdges(
  modelId: number,
  revisionId: number,
  fdmClient: FdmSDK,
  ancestorIds: CogniteInternalId[]
): Promise<{ edges: Array<FdmCadEdge> }> {
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

export async function nodeIdsToNodes(modelId: number, revisionId: number, nodeIds: number[], cogniteClient: CogniteClient): Promise<Node3D[]> {
  return cogniteClient.revisions3D.retrieve3DNodes(modelId, revisionId, nodeIds.map(id => ({ id })));
}
