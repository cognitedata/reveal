/*!
 * Copyright 2023 Cognite AS
 */

import { type CogniteClient, type Node3D } from '@cognite/sdk';
import { Source, type FdmSDK } from '../../utilities/FdmSDK';
import { type TreeIndex, type FdmEdgeWithNode, type FdmCadEdge, FdmNodeDataPromises, CadNodeWithEdges, AncestorQueryResult } from './types';

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

  public getClosestParentFdmData(
    searchTreeIndex: number
  ): FdmNodeDataPromises {
    const cachedFdmData = this._treeIndexToFdmEdges.get(searchTreeIndex);

    if (cachedFdmData === undefined) {
      return this.findAndCacheNodeDataFromAncestors(searchTreeIndex);
    }

    if (cachedFdmData.length === 0) {
      return {
        cadAndFdmNodesPromise: Promise.resolve(undefined),
        viewsPromise: Promise.resolve(undefined)
      };
    }

    const cadAndFdmNodesPromise = Promise.resolve({
      cadNode: cachedFdmData[0].cadNode,
      fdmIds: cachedFdmData.map(data => data.edge.startNode)
    });

    const viewsPromise = this.assertOrAppendViewsForData(searchTreeIndex, cachedFdmData);

    return { cadAndFdmNodesPromise, viewsPromise };
  }

  private async assertOrAppendViewsForData(searchTreeIndex: number, cachedFdmData: FdmEdgeWithNode[]): Promise<Source[] | undefined> {

    if (checkDefinedView(cachedFdmData)) {
      return cachedFdmData.map(data => data.view);
    }

    const cadNode = cachedFdmData[0].cadNode;
    const cadAndFdmEdgePromise = Promise.resolve({
      cadNode,
      edges: cachedFdmData.map(data => data.edge)
    });

    return this.getViewsPromiseForDataPromiseAndCacheData(
      cadAndFdmEdgePromise,
      Promise.resolve([cadNode.treeIndex, searchTreeIndex])
    );
  }

  private findAndCacheNodeDataFromAncestors(
    treeIndex: TreeIndex
  ): FdmNodeDataPromises {
    const ancestorDataPromise = this.getClosestParentMapping(treeIndex);

    const cadAndEdgesPromise = this.getCadAndEdgesPromiseForAncestorData(ancestorDataPromise);
    const cadAndFdmNodesPromise = cadAndEdgesPromise
      .then(cadAndEdges => cadAndEdges !== undefined ?
        ({ cadNode: cadAndEdges.cadNode, fdmIds: cadAndEdges.edges.map(edge => edge.startNode)}) : undefined);

    const ancestorTreeIndexesPromise = ancestorDataPromise.then(data => {
      const treeIndexes = data.ancestorsWithSameMapping.map(ancestor => ancestor.treeIndex);
      return treeIndexes.length === 0 ? [treeIndex] : treeIndexes;
    });

    const viewsPromise = this.getViewsPromiseForDataPromiseAndCacheData(cadAndEdgesPromise, ancestorTreeIndexesPromise);

    return { cadAndFdmNodesPromise, viewsPromise };
  }

  private async getCadAndEdgesPromiseForAncestorData(ancestorDataPromise: Promise<AncestorQueryResult>): Promise<CadNodeWithEdges | undefined> {

    const { edges, ancestorsWithSameMapping, firstMappedAncestorTreeIndex } = await ancestorDataPromise;

    if (edges.length === 0) {
      this.setSameCacheForNodes(ancestorsWithSameMapping, []);
      return undefined;
    }

    const firstMappedAncestor = ancestorsWithSameMapping.find(
      (ancestor) => ancestor.treeIndex === firstMappedAncestorTreeIndex
    );

    assert(firstMappedAncestor !== undefined);

    return { cadNode: firstMappedAncestor, edges };
  }

  private setSameCacheForNodes(nodes: Node3D[], nodeData: FdmEdgeWithNode[]): void {
    nodes.forEach((node) => {
      this._treeIndexToFdmEdges.set(node.treeIndex, nodeData);
    });
  }

  private async getViewsPromiseForDataPromiseAndCacheData(
    cadAndFdmIdsPromise: Promise<CadNodeWithEdges | undefined>,
    treeIndexesWithSameMappingPromise: Promise<TreeIndex[]>
  ): Promise<Array<Source> | undefined> {

    const cadAndFdmIds = await cadAndFdmIdsPromise;
    if (cadAndFdmIds === undefined) {

      const ancestorsWithSameMapping = await treeIndexesWithSameMappingPromise;

      ancestorsWithSameMapping.forEach((treeIndex) => {
        this._treeIndexToFdmEdges.set(treeIndex, []);
      });

      return undefined;
    }

    const nodeInspectionResults = await inspectNodes(
      this._fdmClient,
      cadAndFdmIds.edges.map(edge => edge.startNode)
    );

    const views = nodeInspectionResults.items.map(item => item.inspectionResults.involvedViewsAndContainers.views[0]);

    const dataWithViews = cadAndFdmIds.edges.map((edge, ind) => ({
      edge,
      cadNode: cadAndFdmIds.cadNode,
      view: nodeInspectionResults.items[ind].inspectionResults.involvedViewsAndContainers.views[0]
    }));

    const ancestorsWithSameMapping = await treeIndexesWithSameMappingPromise;

    ancestorsWithSameMapping.forEach((treeIndex) => {
      this._treeIndexToFdmEdges.set(treeIndex, dataWithViews);
    });

    return views;
  }

  private async getClosestParentMapping(treeIndex: number): Promise<AncestorQueryResult> {
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
    const allEdgesWithoutView = this.getAllEdges().filter((edge) => edge.view === undefined);

    if (allEdgesWithoutView.length === 0) {
      return;
    }

    const nodeInspectionResults = await inspectNodes(
      this._fdmClient,
      allEdgesWithoutView.map((edge) => edge.edge.startNode)
    );

    allEdgesWithoutView.forEach((fdmEdgeWithNode, ind) => {
      const edgeWithView = {
        ...fdmEdgeWithNode,
        view: nodeInspectionResults.items[ind].inspectionResults.involvedViewsAndContainers.views[0]
      };

      this.insertTreeIndexMappings(edgeWithView.cadNode.treeIndex, edgeWithView);
    });
  }

  public insertTreeIndexMappings(treeIndex: TreeIndex, edge: FdmEdgeWithNode): void {
    const edgeArray = this._treeIndexToFdmEdges.get(treeIndex);

    if (edgeArray === undefined) {
      this._treeIndexToFdmEdges.set(treeIndex, [edge]);
    } else {
      const presentEdge = edgeArray?.find((e) => e.cadNode.id === edge.cadNode.id);

      if (presentEdge !== undefined) {
        presentEdge.view = edge.view;
        return;
      }

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

export function checkDefinedView(
  edges?: FdmEdgeWithNode[]
): edges is Array<Required<FdmEdgeWithNode>> {
  if (edges === undefined) return false;

  return edges?.every((edge): edge is Required<FdmEdgeWithNode> => edge.view !== undefined);
}
