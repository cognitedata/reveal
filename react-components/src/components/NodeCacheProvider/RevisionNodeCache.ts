/*!
 * Copyright 2023 Cognite AS
 */

import { type CogniteInternalId, type CogniteClient, type Node3D } from '@cognite/sdk';
import {
  type DmsUniqueIdentifier,
  type FdmSDK,
  type InspectResultList
} from '../../utilities/FdmSDK';
import { type TreeIndex } from './NodeCache';

import { maxBy } from 'lodash';
import {
  INSTANCE_SPACE_3D_DATA,
  type InModel3dEdgeProperties,
  SYSTEM_3D_EDGE_SOURCE
} from '../../utilities/globalDataModels';

import assert from 'assert';
import { type Fdm3dNodeData, type FdmEdgeWithNode, type FdmCadEdge } from './Fdm3dNodeData';

export class RevisionNodeCache {
  private readonly _cogniteClient: CogniteClient;
  private readonly _fdmClient: FdmSDK;

  private readonly _modelId: number;
  private readonly _revisionId: number;

  private readonly _treeIndexToFdmEdges = new Map<TreeIndex, FdmEdgeWithNode[]>();

  private readonly _treeIndexToFdmData = new Map<TreeIndex, Fdm3dNodeData[]>();

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
    const cachedFdmData = this._treeIndexToFdmData.get(searchTreeIndex);

    if (cachedFdmData !== undefined) {
      console.log('Cache hit in first cache during tree index lookup');
      return cachedFdmData;
    }

    const cachedFdmEdges = this._treeIndexToFdmEdges.get(searchTreeIndex);

    if (cachedFdmEdges !== undefined) {
      console.log('Cache hit in second cache during tree index lookup');

      return await this.getDataWithViewsForFdmStartNodes(cachedFdmEdges, []);
    }

    return await this.findNodeDataFromAncestors(searchTreeIndex);
  }

  private async findNodeDataFromAncestors(treeIndex: TreeIndex): Promise<Fdm3dNodeData[]> {
    const { edges, ancestorsWithSameMapping, firstMappedAncestorTreeIndex } =
      await this.getClosestParentMapping(treeIndex);

    const cachedFdmData = this._treeIndexToFdmData.get(firstMappedAncestorTreeIndex);

    if (cachedFdmData !== undefined) {
      this.setCacheForNodes(ancestorsWithSameMapping, cachedFdmData);

      return cachedFdmData;
    }

    const firstMappedAncestor = ancestorsWithSameMapping.find(
      (a) => a.treeIndex === firstMappedAncestorTreeIndex
    );

    assert(firstMappedAncestor !== undefined);

    const nodeEdges = edges.map((e) => ({ edge: e, node: firstMappedAncestor }));

    return await this.getDataWithViewsForFdmStartNodes(nodeEdges, ancestorsWithSameMapping);
  }

  private setCacheForNodes(nodes: Node3D[], nodeData: Fdm3dNodeData[]): void {
    nodes.forEach((n) => {
      this._treeIndexToFdmData.set(n.treeIndex, nodeData);
    });
  }

  private async getDataWithViewsForFdmStartNodes(
    nodeEdges: FdmEdgeWithNode[],
    ancestorsWithSameMapping: Node3D[]
  ): Promise<Fdm3dNodeData[]> {
    const nodeInspectionResults = await inspectNodes(
      this._fdmClient,
      nodeEdges.map((edge) => edge.edge.startNode)
    );
    console.log('Inspection results = ', nodeInspectionResults);

    const dataWithViews = nodeEdges.map((fdmEdgeWithNode, ind) => ({
      fdmId: fdmEdgeWithNode.edge.startNode,
      view: nodeInspectionResults.items[ind].inspectionResults.involvedViewsAndContainers.views[0],
      cadNode: fdmEdgeWithNode.node
    }));

    ancestorsWithSameMapping.forEach((ancestor) =>
      this._treeIndexToFdmData.set(ancestor.treeIndex, dataWithViews)
    );

    console.log('Data with views = ', dataWithViews);
    return dataWithViews;
  }

  private async getClosestParentMapping(treeIndex: number): Promise<{
    edges: FdmCadEdge[];
    ancestorsWithSameMapping: Node3D[];
    firstMappedAncestorTreeIndex: number;
  }> {
    const ancestors: Node3D[] = await fetchAncestorNodesForTreeIndex(
      this._modelId,
      this._revisionId,
      treeIndex,
      this._cogniteClient
    );

    const ancestorMappings = await getMappingEdgesForNodeIds(
      this._modelId,
      this._revisionId,
      this._fdmClient,
      ancestors.map((a) => a.id)
    );

    if (ancestorMappings.edges.length === 0) {
      return { edges: [], ancestorsWithSameMapping: [], firstMappedAncestorTreeIndex: 0 };
    }

    const mappings = ancestorMappings.edges.map((e) => {
      const mappingAncestor = ancestors.find((a) => a.id === e.properties.revisionNodeId);

      assert(mappingAncestor !== undefined);

      return {
        edge: e,
        treeIndex: mappingAncestor.treeIndex
      };
    });

    const firstMappedAncestorTreeIndex = maxBy(mappings, (mapping) => mapping.treeIndex)?.treeIndex;

    assert(firstMappedAncestorTreeIndex !== undefined);

    const resultsInLowerTree = mappings.filter((a) => a.treeIndex === firstMappedAncestorTreeIndex);

    return {
      edges: resultsInLowerTree.map((result) => result.edge),
      ancestorsWithSameMapping: ancestors.filter(
        (a) => a.treeIndex >= firstMappedAncestorTreeIndex
      ),
      firstMappedAncestorTreeIndex
    };
  }

  public insertTreeIndexMappings(treeIndex: TreeIndex, edge: FdmEdgeWithNode): void {
    const edgeArray = this._treeIndexToFdmEdges.get(treeIndex);
    if (edgeArray === undefined) {
      this._treeIndexToFdmEdges.set(treeIndex, [edge]);
    } else {
      edgeArray.push(edge);
    }
  }

  public getAllEdges(): FdmEdgeWithNode[] {
    return [...this._treeIndexToFdmEdges.values()].flat();
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

async function getMappingEdgesForNodeIds(
  modelId: number,
  revisionId: number,
  fdmClient: FdmSDK,
  ancestorIds: CogniteInternalId[]
): Promise<{ edges: FdmCadEdge[] }> {
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
    items: dataNodes.map((node) => ({
      instanceType: 'node',
      externalId: node.externalId,
      space: node.space
    }))
  });

  return inspectionResult;
}

async function treeIndexesToNodeIds(
  modelId: number,
  revisionId: number,
  treeIndexes: number[],
  cogniteClient: CogniteClient
): Promise<number[]> {
  const outputsUrl = `${cogniteClient.getBaseUrl()}/api/v1/projects/${
    cogniteClient.project
  }/3d/models/${modelId}/revisions/${revisionId}/nodes/internalids/bytreeindices`;
  const response = await cogniteClient.post<{ items: number[] }>(outputsUrl, {
    data: { items: treeIndexes }
  });
  if (response.status === 200) {
    return response.data.items;
  } else {
    throw Error(`treeIndex-nodeId translation failed for treeIndexes ${treeIndexes.join(',')}`);
  }
}
