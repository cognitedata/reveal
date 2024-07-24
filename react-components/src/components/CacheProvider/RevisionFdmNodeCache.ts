/*!
 * Copyright 2023 Cognite AS
 */

import { type CogniteClient, type Node3D } from '@cognite/sdk';
import { type Source, type FdmSDK, type DmsUniqueIdentifier } from '../../data-providers/FdmSDK';
import {
  type TreeIndex,
  type FdmConnectionWithNode,
  type FdmCadConnection,
  type FdmNodeDataPromises,
  type CadNodeWithConnections,
  type AncestorQueryResult
} from './types';

import { fetchAncestorNodesForTreeIndex, inspectNodes } from './requests';

import { max } from 'lodash';

import assert from 'assert';
import { type Fdm3dDataProvider } from '../../data-providers/Fdm3dDataProvider';

export class RevisionFdmNodeCache {
  private readonly _cogniteClient: CogniteClient;
  private readonly _fdmClient: FdmSDK;
  private readonly _fdm3dDataProvider: Fdm3dDataProvider;

  private readonly _modelId: number;
  private readonly _revisionId: number;

  private readonly _treeIndexToFdmConnections = new Map<TreeIndex, FdmConnectionWithNode[]>();

  private readonly _modelInstances: Promise<DmsUniqueIdentifier[] | undefined>;

  constructor(
    cogniteClient: CogniteClient,
    fdmClient: FdmSDK,
    fdmDataProvider: Fdm3dDataProvider,
    modelId: number,
    revisionId: number
  ) {
    this._cogniteClient = cogniteClient;
    this._fdmClient = fdmClient;
    this._fdm3dDataProvider = fdmDataProvider;

    this._modelId = modelId;
    this._revisionId = revisionId;
    this._modelInstances = fdmDataProvider.getDMSModels(this._modelId).catch(() => undefined);
  }

  public getClosestParentFdmData(searchTreeIndex: number): FdmNodeDataPromises {
    const cachedFdmData = this._treeIndexToFdmConnections.get(searchTreeIndex);

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
      fdmIds: cachedFdmData.map((data) => data.connection.instance)
    });

    const viewsPromise = this.assertOrFetchViewsForNodeData(searchTreeIndex, cachedFdmData);

    return { cadAndFdmNodesPromise, viewsPromise };
  }

  private async assertOrFetchViewsForNodeData(
    searchTreeIndex: number,
    cachedFdmData: FdmConnectionWithNode[]
  ): Promise<Source[] | undefined> {
    if (checkDefinedView(cachedFdmData)) {
      return cachedFdmData.map((data) => data.view);
    }

    const cadNode = cachedFdmData[0].cadNode;
    const cadNodeWithEdges = {
      cadNode,
      connections: cachedFdmData.map((data) => data.connection)
    };

    return await this.getAndCacheViewsPromiseForNodeData(cadNodeWithEdges, [
      cadNode.treeIndex,
      searchTreeIndex
    ]);
  }

  private findAndCacheNodeDataFromAncestors(treeIndex: TreeIndex): FdmNodeDataPromises {
    const ancestorDataPromise = this.getClosestParentMapping(treeIndex);

    const cadAndEdgesPromise = this.getCadAndEdgesPromiseForAncestorData(ancestorDataPromise);
    const cadAndFdmNodesPromise = cadAndEdgesPromise.then((cadAndEdges) =>
      cadAndEdges === undefined
        ? undefined
        : {
            cadNode: cadAndEdges.cadNode,
            fdmIds: cadAndEdges.connections.map((edge) => edge.instance)
          }
    );

    const viewsPromise = this.getViewsPromiseFromDataPromises(
      cadAndEdgesPromise,
      ancestorDataPromise
    );

    return { cadAndFdmNodesPromise, viewsPromise };
  }

  private async getViewsPromiseFromDataPromises(
    cadAndEdgesPromise: Promise<CadNodeWithConnections | undefined>,
    ancestorDataPromise: Promise<AncestorQueryResult>
  ): Promise<Source[] | undefined> {
    const cadAndEdges = await cadAndEdgesPromise;
    const { ancestorsWithSameMapping } = await ancestorDataPromise;
    const ancestorTreeIndexes = ancestorsWithSameMapping.map((ancestor) => ancestor.treeIndex);

    const cachedTreeIndexesDescending = ancestorTreeIndexes
      .filter((treeIndex) => this._treeIndexToFdmConnections.has(treeIndex))
      .sort((a, b) => b - a);

    const cachedNodeData =
      cachedTreeIndexesDescending.length !== 0
        ? this._treeIndexToFdmConnections.get(cachedTreeIndexesDescending[0])
        : undefined;

    if (checkDefinedView(cachedNodeData)) {
      this.setCacheDataForTreeIndices(ancestorTreeIndexes, cachedNodeData);
      return cachedNodeData.map((data) => data.view);
    }

    return await this.getAndCacheViewsPromiseForNodeData(cadAndEdges, ancestorTreeIndexes);
  }

  private async getCadAndEdgesPromiseForAncestorData(
    ancestorDataPromise: Promise<AncestorQueryResult>
  ): Promise<CadNodeWithConnections | undefined> {
    const { connections, ancestorsWithSameMapping, firstMappedAncestorTreeIndex } =
      await ancestorDataPromise;

    if (connections.length === 0) {
      this.setCacheDataForTreeIndices(
        ancestorsWithSameMapping.map((a) => a.treeIndex),
        []
      );
      return undefined;
    }

    const firstMappedAncestor = ancestorsWithSameMapping.find(
      (ancestor) => ancestor.treeIndex === firstMappedAncestorTreeIndex
    );

    assert(firstMappedAncestor !== undefined);

    return { cadNode: firstMappedAncestor, connections };
  }

  private setCacheDataForTreeIndices(
    treeIndices: number[],
    nodeData: FdmConnectionWithNode[]
  ): void {
    treeIndices.forEach((treeIndex) => {
      this._treeIndexToFdmConnections.set(treeIndex, nodeData);
    });
  }

  private async getAndCacheViewsPromiseForNodeData(
    cadAndFdmIds: CadNodeWithConnections | undefined,
    ancestorIndicesWithSameMapping: TreeIndex[]
  ): Promise<Source[] | undefined> {
    if (cadAndFdmIds === undefined) {
      this.setCacheDataForTreeIndices(ancestorIndicesWithSameMapping, []);
      return undefined;
    }

    const nodeInspectionResults = await inspectNodes(
      this._fdmClient,
      cadAndFdmIds.connections.map((edge) => edge.instance)
    );

    const views = nodeInspectionResults.items.map(
      (item) => item.inspectionResults.involvedViews[0]
    );

    const dataWithViews = cadAndFdmIds.connections.map((connection, ind) => ({
      connection,
      cadNode: cadAndFdmIds.cadNode,
      view: nodeInspectionResults.items[ind].inspectionResults.involvedViews[0]
    }));

    this.setCacheDataForTreeIndices(ancestorIndicesWithSameMapping, dataWithViews);

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
      return {
        connections: [],
        ancestorsWithSameMapping: ancestors,
        firstMappedAncestorTreeIndex: -1
      };
    }

    const connectionsWithCorrespondingTreeIndex = this.combineEdgesWithTreeIndex(
      ancestorMappings,
      ancestors
    );

    const firstMappedAncestorTreeIndex = findLargestTreeIndex(
      connectionsWithCorrespondingTreeIndex
    );
    return getAncestorDataForTreeIndex(
      firstMappedAncestorTreeIndex,
      connectionsWithCorrespondingTreeIndex,
      ancestors
    );
  }

  private combineEdgesWithTreeIndex(
    mappingEdges: FdmCadConnection[],
    nodes: Node3D[]
  ): Array<{ connection: FdmCadConnection; treeIndex: TreeIndex }> {
    return mappingEdges.map((connection) => {
      const ancestorConnectedToEdge = nodes.find(
        (ancestor) => ancestor.id === connection.revisionId
      );

      assert(ancestorConnectedToEdge !== undefined);

      return {
        connection,
        treeIndex: ancestorConnectedToEdge.treeIndex
      };
    });
  }

  private async getMappingEdgesForAncestors(ancestors: Node3D[]): Promise<FdmCadConnection[]> {
    const cachedFirstMappedAncestor = ancestors
      .filter((ancestor) => this._treeIndexToFdmConnections.has(ancestor.treeIndex))
      .sort((nodeA, nodeB) => nodeB.treeIndex - nodeA.treeIndex)[0];

    if (cachedFirstMappedAncestor !== undefined) {
      const edgesAndNodes = this._treeIndexToFdmConnections.get(
        cachedFirstMappedAncestor.treeIndex
      );

      assert(edgesAndNodes !== undefined);

      return edgesAndNodes.map((edge) => edge.connection);
    }
    const modelInstances = await this._modelInstances;
    if (modelInstances === undefined) {
      return [];
    }

    const ancestorMappings = await this._fdm3dDataProvider.getFdmConnectionsForNodeIds(
      modelInstances,
      this._revisionId,
      ancestors.map((a) => a.id)
    );

    return ancestorMappings;
  }

  public async fetchViewsForAllEdges(): Promise<void> {
    const allConnectionsWithoutView = this.getAllEdges().filter((edge) => edge.view === undefined);

    if (allConnectionsWithoutView.length === 0) {
      return;
    }

    const nodeInspectionResults = await inspectNodes(
      this._fdmClient,
      allConnectionsWithoutView.map((connection) => connection.connection.instance)
    );

    allConnectionsWithoutView.forEach((fdmEdgeWithNode, ind) => {
      const edgeWithView = {
        ...fdmEdgeWithNode,
        view: nodeInspectionResults.items[ind].inspectionResults.involvedViews[0]
      };

      this.insertTreeIndexMappings(edgeWithView.cadNode.treeIndex, edgeWithView);
    });
  }

  public insertTreeIndexMappings(treeIndex: TreeIndex, edge: FdmConnectionWithNode): void {
    const edgeArray = this._treeIndexToFdmConnections.get(treeIndex);

    if (edgeArray === undefined) {
      this._treeIndexToFdmConnections.set(treeIndex, [edge]);
    } else {
      const presentEdge = edgeArray?.find((e) => e.cadNode.id === edge.cadNode.id);

      if (presentEdge !== undefined) {
        presentEdge.view = edge.view;
        return;
      }

      edgeArray.push(edge);
    }
  }

  public getAllEdges(): FdmConnectionWithNode[] {
    return [...this._treeIndexToFdmConnections.values()].flat();
  }
}

function findLargestTreeIndex(
  edgesWithTreeIndex: Array<{ connection: FdmCadConnection; treeIndex: TreeIndex }>
): TreeIndex {
  const maxTreeIndex = max(edgesWithTreeIndex.map((e) => e.treeIndex));
  assert(maxTreeIndex !== undefined);
  return maxTreeIndex;
}

function getAncestorDataForTreeIndex(
  treeIndex: TreeIndex,
  connectionsWithTreeIndex: Array<{ connection: FdmCadConnection; treeIndex: TreeIndex }>,
  ancestors: Node3D[]
): AncestorQueryResult {
  const edgesForTreeIndex = connectionsWithTreeIndex.filter(
    (edgeAndTreeIndex) => edgeAndTreeIndex.treeIndex === treeIndex
  );
  const ancestorsBelowTreeIndex = ancestors.filter((ancestor) => ancestor.treeIndex >= treeIndex);

  return {
    connections: edgesForTreeIndex.map((result) => result.connection),
    ancestorsWithSameMapping: ancestorsBelowTreeIndex,
    firstMappedAncestorTreeIndex: treeIndex
  };
}

export function checkDefinedView(
  edges?: FdmConnectionWithNode[]
): edges is Array<Required<FdmConnectionWithNode>> {
  if (edges === undefined) return false;

  return edges?.every((edge): edge is Required<FdmConnectionWithNode> => edge.view !== undefined);
}
