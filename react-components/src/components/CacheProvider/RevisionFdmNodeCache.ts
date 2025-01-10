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

const emptyAncestorQueryResult: AncestorQueryResult = {
  connections: [],
  ancestorsWithSameMapping: [],
  firstMappedAncestorTreeIndex: -1
};

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
  ): Promise<Source[][] | undefined> {
    if (checkDefinedViews(cachedFdmData)) {
      return cachedFdmData.map((data) => data.views);
    }

    const cadNode = cachedFdmData[0].cadNode;
    const cadNodeWithConnections = {
      cadNode,
      connections: cachedFdmData.map((data) => data.connection)
    };

    return await this.getAndCacheViewsPromiseForNodeData(cadNodeWithConnections, [
      cadNode.treeIndex,
      searchTreeIndex
    ]);
  }

  private findAndCacheNodeDataFromAncestors(treeIndex: TreeIndex): FdmNodeDataPromises {
    const ancestorDataPromise = this.getClosestParentMapping(treeIndex);

    const cadAndConnectionsPromise =
      this.getCadAndConnectionsPromiseForAncestorData(ancestorDataPromise);
    const cadAndFdmNodesPromise = cadAndConnectionsPromise.then((cadAndConnections) =>
      cadAndConnections === undefined
        ? undefined
        : {
            cadNode: cadAndConnections.cadNode,
            fdmIds: cadAndConnections.connections.map((connection) => connection.instance)
          }
    );

    const viewsPromise = this.getViewsPromiseFromDataPromises(
      cadAndConnectionsPromise,
      ancestorDataPromise
    );

    return { cadAndFdmNodesPromise, viewsPromise };
  }

  private async getViewsPromiseFromDataPromises(
    cadAndConnectionsPromise: Promise<CadNodeWithConnections | undefined>,
    ancestorDataPromise: Promise<AncestorQueryResult>
  ): Promise<Source[][] | undefined> {
    const cadAndConnections = await cadAndConnectionsPromise;
    const { ancestorsWithSameMapping } = await ancestorDataPromise;
    const ancestorTreeIndexes = ancestorsWithSameMapping.map((ancestor) => ancestor.treeIndex);

    const cachedTreeIndexesDescending = ancestorTreeIndexes
      .filter((treeIndex) => this._treeIndexToFdmConnections.has(treeIndex))
      .sort((a, b) => b - a);

    const cachedNodeData =
      cachedTreeIndexesDescending.length !== 0
        ? this._treeIndexToFdmConnections.get(cachedTreeIndexesDescending[0])
        : undefined;

    if (checkDefinedViews(cachedNodeData)) {
      this.setCacheDataForTreeIndices(ancestorTreeIndexes, cachedNodeData);
      return cachedNodeData.map((data) => data.views);
    }

    return await this.getAndCacheViewsPromiseForNodeData(cadAndConnections, ancestorTreeIndexes);
  }

  private async getCadAndConnectionsPromiseForAncestorData(
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
  ): Promise<Source[][] | undefined> {
    if (cadAndFdmIds === undefined) {
      this.setCacheDataForTreeIndices(ancestorIndicesWithSameMapping, []);
      return undefined;
    }

    const nodeInspectionResults = await inspectNodes(
      this._fdmClient,
      cadAndFdmIds.connections.map((connection) => connection.instance)
    );

    const views = nodeInspectionResults.items.map((item) => item.inspectionResults.involvedViews);

    const dataWithViews = cadAndFdmIds.connections.map((connection, ind) => ({
      connection,
      cadNode: cadAndFdmIds.cadNode,
      view: views[ind]
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

    const ancestorMappings = await this.getMappingConnectionsForAncestors(ancestors);

    if (ancestorMappings.length === 0) {
      return emptyAncestorQueryResult;
    }

    const connectionsWithCorrespondingTreeIndex = this.combineConnectionsWithTreeIndex(
      ancestorMappings,
      ancestors
    );

    const firstMappedAncestorTreeIndex = findLargestTreeIndex(
      connectionsWithCorrespondingTreeIndex
    );

    if (firstMappedAncestorTreeIndex === undefined) {
      return emptyAncestorQueryResult;
    }

    return getAncestorDataForTreeIndex(
      firstMappedAncestorTreeIndex,
      connectionsWithCorrespondingTreeIndex,
      ancestors
    );
  }

  private combineConnectionsWithTreeIndex(
    mappingConnections: FdmCadConnection[],
    nodes: Node3D[]
  ): Array<{ connection: FdmCadConnection; treeIndex: TreeIndex }> {
    return mappingConnections.reduce((acc, connection) => {
      const nodeInConnection = nodes.find((node) => node.treeIndex === connection.treeIndex);

      if (nodeInConnection !== undefined) {
        acc.push({
          connection,
          treeIndex: nodeInConnection.treeIndex
        });
      }

      return acc;
    }, new Array<{ connection: FdmCadConnection; treeIndex: TreeIndex }>());
  }

  private async getMappingConnectionsForAncestors(
    ancestors: Node3D[]
  ): Promise<FdmCadConnection[]> {
    const cachedFirstMappedAncestor = ancestors
      .filter((ancestor) => this._treeIndexToFdmConnections.has(ancestor.treeIndex))
      .sort((nodeA, nodeB) => nodeB.treeIndex - nodeA.treeIndex)[0];

    if (cachedFirstMappedAncestor !== undefined) {
      const connectionsAndNodes = this._treeIndexToFdmConnections.get(
        cachedFirstMappedAncestor.treeIndex
      );

      assert(connectionsAndNodes !== undefined);

      return connectionsAndNodes.map((connection) => connection.connection);
    }
    const modelInstances = await this._modelInstances;
    if (modelInstances === undefined || modelInstances.length === 0) {
      return [];
    }

    const ancestorMappings = await this._fdm3dDataProvider.getFdmConnectionsForNodes(
      modelInstances,
      this._revisionId,
      ancestors
    );

    return ancestorMappings;
  }

  public async fetchViewsForAllConnections(): Promise<void> {
    const allConnectionsWithoutView = this.getAllConnections().filter(
      (connection) => connection.views === undefined || connection.views.length === 0
    );

    if (allConnectionsWithoutView.length === 0) {
      return;
    }

    const nodeInspectionResults = await inspectNodes(
      this._fdmClient,
      allConnectionsWithoutView.map((connection) => connection.connection.instance)
    );

    allConnectionsWithoutView.forEach((fdmConnectionWithNode, ind) => {
      const connectionWithView: FdmConnectionWithNode = {
        ...fdmConnectionWithNode,
        views: [nodeInspectionResults.items[ind].inspectionResults.involvedViews[0]]
      };

      this.insertTreeIndexMappings(connectionWithView.cadNode.treeIndex, connectionWithView);
    });
  }

  public insertTreeIndexMappings(treeIndex: TreeIndex, connection: FdmConnectionWithNode): void {
    const connectionArray = this._treeIndexToFdmConnections.get(treeIndex);

    if (connectionArray === undefined) {
      this._treeIndexToFdmConnections.set(treeIndex, [connection]);
    } else {
      const presentConnection = connectionArray?.find(
        (e) => e.cadNode.id === connection.cadNode.id
      );

      if (presentConnection !== undefined) {
        presentConnection.views = connection.views;
        return;
      }

      connectionArray.push(connection);
    }
  }

  public getAllConnections(): FdmConnectionWithNode[] {
    return [...this._treeIndexToFdmConnections.values()].flat();
  }
}

function findLargestTreeIndex(
  connectionsWithTreeIndex: Array<{ connection: FdmCadConnection; treeIndex: TreeIndex }>
): TreeIndex | undefined {
  return max(connectionsWithTreeIndex.map((e) => e.treeIndex));
}

function getAncestorDataForTreeIndex(
  treeIndex: TreeIndex,
  connectionsWithTreeIndex: Array<{ connection: FdmCadConnection; treeIndex: TreeIndex }>,
  ancestors: Node3D[]
): AncestorQueryResult {
  const connectionsForTreeIndex = connectionsWithTreeIndex.filter(
    (connectionAndTreeIndex) => connectionAndTreeIndex.treeIndex === treeIndex
  );
  const ancestorsBelowTreeIndex = ancestors.filter((ancestor) => ancestor.treeIndex >= treeIndex);

  return {
    connections: connectionsForTreeIndex.map((result) => result.connection),
    ancestorsWithSameMapping: ancestorsBelowTreeIndex,
    firstMappedAncestorTreeIndex: treeIndex
  };
}

export function checkDefinedViews(
  connections?: FdmConnectionWithNode[]
): connections is Array<Required<FdmConnectionWithNode>> {
  if (connections === undefined) return false;

  return connections?.every(
    (connection): connection is Required<FdmConnectionWithNode> =>
      connection.views !== undefined && connection.views.length > 0
  );
}
