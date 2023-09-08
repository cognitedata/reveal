/*!
 * Copyright 2023 Cognite AS
 */

import { type CogniteClient, type Node3D } from '@cognite/sdk';
import { type FdmSDK } from '../../utilities/FdmSDK';
import { type TreeIndex, type FdmEdgeWithNode, type FdmCadEdge } from './types';

import {
  fetchAncestorNodesForTreeIndex,
  getMappingEdgesForNodeIds,
  inspectNodes
} from './requests';

import { max } from 'lodash';

import assert from 'assert';

export class RevisionFdmNodeCache {
  private readonly _cogniteClient: CogniteClient;
  private readonly _fdmClient: FdmSDK;

  private readonly _modelId: number;
  private readonly _revisionId: number;

  private readonly _treeIndexToFdmEdges = new Map<TreeIndex, FdmEdgeWithNode[]>();

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

  public async getClosestParentFdmData(searchTreeIndex: number): Promise<Required<FdmEdgeWithNode>[]> {
    const cachedFdmData = this._treeIndexToFdmEdges.get(searchTreeIndex);

    if (checkDefinedView(cachedFdmData)) {
      return cachedFdmData;
    }

    if (cachedFdmData !== undefined) {
      return await this.getDataWithViewsForFdmEdges(cachedFdmData, []);
    }

    return await this.findNodeDataFromAncestors(searchTreeIndex);
  }

  private async findNodeDataFromAncestors(treeIndex: TreeIndex): Promise<Required<FdmEdgeWithNode>[]> {
    const { edges, ancestorsWithSameMapping, firstMappedAncestorTreeIndex } =
      await this.getClosestParentMapping(treeIndex);

    if (edges.length === 0) {
      return [];
    }

    const cachedFdmData = this._treeIndexToFdmEdges.get(firstMappedAncestorTreeIndex);

    if (checkDefinedView(cachedFdmData)) {
      this.setCacheForNodes(ancestorsWithSameMapping, cachedFdmData);

      return cachedFdmData;
    }

    const firstMappedAncestor = ancestorsWithSameMapping.find(
      (ancestor) => ancestor.treeIndex === firstMappedAncestorTreeIndex
    );

    assert(firstMappedAncestor !== undefined);

    const nodeEdges = edges.map((edge) => ({ edge, node: firstMappedAncestor }));

    return await this.getDataWithViewsForFdmEdges(nodeEdges, ancestorsWithSameMapping);
  }

  private setCacheForNodes(nodes: Node3D[], nodeData: FdmEdgeWithNode[]): void {
    nodes.forEach((node) => {
      this._treeIndexToFdmEdges.set(node.treeIndex, nodeData);
    });
  }

  private async getDataWithViewsForFdmEdges(
    nodeEdges: Array<{ edge: FdmCadEdge; node: Node3D }>,
    ancestorsWithSameMapping: Node3D[]
  ): Promise<Required<FdmEdgeWithNode>[]> {
    const nodeInspectionResults = await inspectNodes(
      this._fdmClient,
      nodeEdges.map((edge) => edge.edge.startNode)
    );

    const dataWithViews = nodeEdges.map((fdmEdgeWithNode, ind) => ({
      ...fdmEdgeWithNode,
      view: nodeInspectionResults.items[ind].inspectionResults.involvedViewsAndContainers.views[0]
    }));

    ancestorsWithSameMapping.forEach((ancestor) => {
      this._treeIndexToFdmEdges.set(ancestor.treeIndex, dataWithViews);
    });

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

    const ancestorMappings = await this.getMappingEdgesForAncestors(ancestors);

    if (ancestorMappings.length === 0) {
      return { edges: [], ancestorsWithSameMapping: [], firstMappedAncestorTreeIndex: 0 };
    }

    const edgesWithCorrespondingTreeIndex = this.combineEdgesWithTreeIndex(
      ancestorMappings,
      ancestors
    );

    const firstMappedAncestorTreeIndex = findLargestTreeIndex(edgesWithCorrespondingTreeIndex);
    return getAncestorDataForTreeIndex(
      firstMappedAncestorTreeIndex,
      edgesWithCorrespondingTreeIndex,
      ancestors
    );
  }

  private combineEdgesWithTreeIndex(
    mappingEdges: FdmCadEdge[],
    nodes: Node3D[]
  ): Array<{ edge: FdmCadEdge; treeIndex: TreeIndex }> {
    return mappingEdges.map((edge) => {
      const ancestorConnectedToEdge = nodes.find(
        (ancestor) => ancestor.id === edge.properties.revisionNodeId
      );

      assert(ancestorConnectedToEdge !== undefined);

      return {
        edge,
        treeIndex: ancestorConnectedToEdge.treeIndex
      };
    });
  }

  private async getMappingEdgesForAncestors(ancestors: Node3D[]): Promise<FdmCadEdge[]> {
    const cachedFirstMappedAncestor = ancestors
      .filter((ancestor) => this._treeIndexToFdmEdges.has(ancestor.treeIndex))
      .sort((nodeA, nodeB) => nodeB.treeIndex - nodeA.treeIndex)[0];

    if (cachedFirstMappedAncestor !== undefined) {
      const edgesAndNodes = this._treeIndexToFdmEdges.get(cachedFirstMappedAncestor.treeIndex);

      assert(edgesAndNodes !== undefined);

      return edgesAndNodes.map((edge) => edge.edge);
    }

    const ancestorMappings = await getMappingEdgesForNodeIds(
      this._modelId,
      this._revisionId,
      this._fdmClient,
      ancestors.map((a) => a.id)
    );

    return ancestorMappings.edges;
  }

  public async fetchViewsForAllEdges(): Promise<void> {
    const allEdges = this.getAllEdges();

    if (allEdges.length === 0) {
      return;
    }

    const nodeInspectionResults = await inspectNodes(
      this._fdmClient,
      allEdges.map((edge) => edge.edge.startNode)
    );

    const dataWithViews = allEdges.map((fdmEdgeWithNode, ind) => ({
      ...fdmEdgeWithNode,
      view: nodeInspectionResults.items[ind].inspectionResults.involvedViewsAndContainers.views[0]
    }));

    this.setCacheForNodes(allEdges.map((edge) => edge.node), dataWithViews);
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
}

function findLargestTreeIndex(
  edgesWithTreeIndex: Array<{ edge: FdmCadEdge; treeIndex: TreeIndex }>
): TreeIndex {
  const maxTreeIndex = max(edgesWithTreeIndex.map((e) => e.treeIndex));
  assert(maxTreeIndex !== undefined);
  return maxTreeIndex;
}

function getAncestorDataForTreeIndex(
  treeIndex: TreeIndex,
  edgesWithTreeIndex: Array<{ edge: FdmCadEdge; treeIndex: TreeIndex }>,
  ancestors: Node3D[]
): {
  edges: FdmCadEdge[];
  ancestorsWithSameMapping: Node3D[];
  firstMappedAncestorTreeIndex: number;
} {
  const edgesForTreeIndex = edgesWithTreeIndex.filter(
    (edgeAndTreeIndex) => edgeAndTreeIndex.treeIndex === treeIndex
  );
  const ancestorsBelowTreeIndex = ancestors.filter((ancestor) => ancestor.treeIndex >= treeIndex);

  return {
    edges: edgesForTreeIndex.map((result) => result.edge),
    ancestorsWithSameMapping: ancestorsBelowTreeIndex,
    firstMappedAncestorTreeIndex: treeIndex
  };
}

export function checkDefinedView(edges?: FdmEdgeWithNode[]): edges is Required<FdmEdgeWithNode>[] {
  if (!edges) return false;

  return edges?.every((edge): edge is Required<FdmEdgeWithNode> => edge.view !== undefined);
}
