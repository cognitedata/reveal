/*!
 * Copyright 2023 Cognite AS
 */

import { type CogniteClient, type Node3D } from '@cognite/sdk';
import { type Source, type FdmSDK, type DmsUniqueIdentifier } from '../../utilities/FdmSDK';
import {
  type TreeIndex,
  type FdmEdgeWithNode,
  type FdmCadEdge,
  type FdmNodeDataPromises,
  FdmAndCadNode
} from './types';

import {
  fetchAncestorNodesForTreeIndex,
  getMappingEdgesForNodeIds,
  inspectNodes
} from './requests';

import { max } from 'lodash';

import assert from 'assert';

type AncestorQueryResult = {
  edges: FdmCadEdge[];
  ancestorsWithSameMapping: Node3D[];
  firstMappedAncestorTreeIndex: number;
};

export class RevisionFdmNodeCache {
  private readonly _cogniteClient: CogniteClient;
  private readonly _fdmClient: FdmSDK;

  private readonly _modelId: number;
  private readonly _revisionId: number;

  private readonly _treeIndexToFdmEdge = new Map<TreeIndex, FdmAndCadNode[]>();
  private readonly _treeIndexToView = new Map<TreeIndex, Source[]>();

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

  public getClosestParentFdmData(searchTreeIndex: number): FdmNodeDataPromises {
    const cachedFdmData = this._treeIndexToFdmEdge.get(searchTreeIndex);

    if (checkDefinedView(cachedFdmData)) {
      return cachedFdmData;
    }

    const cachedFdmEdges = this._treeIndexToFdmEdge.get(searchTreeIndex);

    if (cachedFdmEdges !== undefined && cachedFdmEdges.length > 0) {
      const dataViews = this.getDataViewsForFdmIds(
        cachedFdmEdges.map((edge) => edge.edge.startNode)
      );
      const fdmDataViewPromises = constructFdmDataAndViewsPromises(cachedFdmEdges, dataViews);

      this.cacheFdmDataPromisesForTreeIndices([searchTreeIndex], fdmDataViewPromises);
      return fdmDataViewPromises;
    }

    return this.findNodeDataPromisesFromAncestors(searchTreeIndex);

    function constructFdmDataAndViewsPromises(
      fdmEdges: FdmEdgeWithNode[],
      dataViewsPromise: Promise<Source[]>
    ): FdmNodeDataPromises {
      const cadNode = fdmEdges[0].node;
      const fdmIds = fdmEdges.map((edge) => edge.edge.startNode);

      return {
        cadNodeAndFdmIdPromise: Promise.resolve({ cadNode, fdmIds }),
        viewsPromise: dataViewsPromise
      };
    }
  }

  private findNodeDataPromisesFromAncestors(treeIndex: TreeIndex): FdmNodeDataPromises {
    const closestParentMappingDataPromise = this.getClosestParentMapping(treeIndex);

    const nodeAndFdmIdPromise = this.getNodeAndFdmIdFromParentForClosestAncestor(
      closestParentMappingDataPromise
    );
    const dataViewsPromise = this.getDataViewsPromiseForFdmEdgesPromise(nodeAndFdmIdPromise);

    const fdmNodeDataPromises = {
      cadNodeAndFdmIdPromise: nodeAndFdmIdPromise,
      viewsPromise: dataViewsPromise
    };

    void this.cacheFdmDataPromisesForAncestors(
      closestParentMappingDataPromise,
      fdmNodeDataPromises
    );

    return fdmNodeDataPromises;

    /* const getViewsPromise = async (edgesPromise: Promise<AncestorQueryResult>): Promise<Source[]> => {
      const { edges } = await edgesPromise;
      return this.getDataViewsForFdmEdges(edges);
      }

    const processClosestMappingData = async (dataPromise: Promise<AncestorQueryResult>): Promise<FdmNodeDataPromises> => {

      const dataViewsPromise = getViewsPromise(dataPromise);

      this.cacheDataAndViews(ancestorsWithSameMapping, { edges, node: firstMappedAncestor }, dataViewsPromise);


      return { cadNodeAndFdmIdPromise: dataPromise.then(data => ({ cadNode: firstMappedAncestor, fdmIds: data.edges.map(edge => edge.startNode) })), views: dataViewsPromise };
    }


    return processClosestMappingData(closestParentMappingDataPromise); */
  }

  private async cacheFdmDataPromisesForAncestors(
    ancestorQueryResult: Promise<AncestorQueryResult>,
    dataToCache: FdmNodeDataPromises
  ): Promise<void> {
    const { ancestorsWithSameMapping } = await ancestorQueryResult;

    const treeIndices = ancestorsWithSameMapping.map((ancestor) => ancestor.treeIndex);
    this.cacheFdmDataPromisesForTreeIndices(treeIndices, dataToCache);
  }

  private async getDataViewsPromiseForFdmEdgesPromise(
    fdmNodeData: Promise<{ cadNode: Node3D; fdmIds: DmsUniqueIdentifier[] } | undefined>
  ): Promise<Source[] | undefined> {
    const fdmIds = (await fdmNodeData)?.fdmIds;
    if (fdmIds === undefined) {
      return undefined;
    }

    return await this.getDataViewsForFdmIds(fdmIds);
  }

  private async getDataViewsForFdmIds(fdmIds: DmsUniqueIdentifier[]): Promise<Source[]> {
    const nodeInspectionResults = await inspectNodes(this._fdmClient, fdmIds);

    const dataViews = nodeInspectionResults.items.map(
      (result) => result.inspectionResults.involvedViewsAndContainers.views[0]
    );
    return dataViews;
  }

  private async getNodeAndFdmIdFromParentForClosestAncestor(
    ancestorData: Promise<AncestorQueryResult>
  ): Promise<{ cadNode: Node3D; fdmIds: DmsUniqueIdentifier[] } | undefined> {
    const { edges, ancestorsWithSameMapping, firstMappedAncestorTreeIndex } = await ancestorData;

    if (edges.length === 0) {
      return undefined;
    }

    /* const cachedFdmData = this._treeIndexToFdmData.get(firstMappedAncestorTreeIndex);

    if (checkDefinedView(cachedFdmData)) {
      this.setSameCacheForNodes(ancestorsWithSameMapping, cachedFdmData);

      return cachedFdmData;
    } */

    const firstMappedAncestor = ancestorsWithSameMapping.find(
      (ancestor) => ancestor.treeIndex === firstMappedAncestorTreeIndex
    );

    assert(firstMappedAncestor !== undefined);

    return { cadNode: firstMappedAncestor, fdmIds: edges.map((edge) => edge.startNode) };
  }

  private cacheFdmDataPromisesForTreeIndices(
    treeIndices: number[],
    fdmDataPromises: FdmNodeDataPromises
  ): void {
    treeIndices.forEach((treeIndex) => this._treeIndexToFdmEdge.set(treeIndex, fdmDataPromises));
  }

  /* private async cacheDataAndViews(ancestorsWithSameMapping: Node3D[], nodeEdges: { edges: FdmCadEdge[], node: Node3D }, dataViewPromises: Promise<Source[]>) {

    ancestorsWithSameMapping.forEach((ancestor) =>
      this._treeIndexToFdmData.set(ancestor.treeIndex, dataWithViews)
                                    );

  }


  private setCacheForNodes(nodes: Node3D[], nodeData: Fdm3dNodeData[]): void {
    nodes.forEach((node) => {
      this._treeIndexToFdmData.set(node.treeIndex, nodeData);
    });
  } */

  /* private async getDataViewsForFdmEdges(
    nodeEdges: FdmCadEdge[]
  ): Promise<Source[]> {

    // const dataWithViews = nodeEdges.map((fdmEdgeWithNode, ind) => ({
    //   fdmId: fdmEdgeWithNode.edge.startNode,
    //   view: nodeInspectionResults.items[ind].inspectionResults.involvedViewsAndContainers.views[0],
    //   cadNode: fdmEdgeWithNode.node
    // }));

    const nodeInspectionResults = await inspectNodes(
      this._fdmClient,
      nodeEdges.map((edge) => edge.edge.startNode)
    );

    const dataViews =  nodeInspectionResults.items.map(result => result.inspectionResults.involvedViewsAndContainers.views[0]);
    return dataViews;
  } */

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
      .filter((ancestor) => this._treeIndexToFdmEdge.has(ancestor.treeIndex))
      .sort((nodeA, nodeB) => nodeB.treeIndex - nodeA.treeIndex)[0];

    if (cachedFirstMappedAncestor !== undefined) {
      const edgesAndNodes = this._treeIndexToFdmEdge.get(cachedFirstMappedAncestor.treeIndex);

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

      this.insertTreeIndexMappings(edgeWithView.node.treeIndex, edgeWithView);
    });
  }

  public insertNodeDataForTreeIndex(treeIndex: TreeIndex, edges: FdmEdgeWithNode[]): void {
    const nodeObjects = edges.map(edge => ({cadNode: edge.node, fdmNode: edge.edge.startNode }));
    this._treeIndexToFdmEdge.set(treeIndex, nodeObjects);
  }

  public insertViewsForTreeIndex(treeIndex: TreeIndex, views: Source[]): void {
    this._treeIndexToView.set(treeIndex, views);
  }

  /* public insertTreeIndexMappings(treeIndex: TreeIndex, edge: FdmEdgeWithNode): void {
    const edgeArray = this._treeIndexToFdmEdge.get(treeIndex);

    if (edgeArray === undefined) {
      this._treeIndexToFdmEdge.set(treeIndex, [edge]);
    } else {
      const presentEdge = edgeArray?.find((e) => e.node.id === edge.node.id);

      if (presentEdge !== undefined) {
        presentEdge.view = edge.view;
        return;
      }

      edgeArray.push(edge);
    }
  } */

  public getAllEdges(): FdmEdgeWithNode[] {
    return [...this._treeIndexToFdmEdge.values()].flat();
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
): AncestorQueryResult {
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
  edges?: FdmNodeDataPromises | undefined
): edges is FdmNodeDataPromises {
  if (edges === undefined) return false;

  return edges?.every((edge): edge is Required<FdmEdgeWithNode> => edge.view !== undefined);
}
