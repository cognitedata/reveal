import {
  Asset,
  AssetIdEither,
  CogniteInternalId,
  InternalId,
  ListResponse,
} from '@cognite/sdk';
import React, { useCallback, useEffect, useState } from 'react';

import { UseQueryResult } from 'react-query';
import union from 'lodash/union';
import Tree, { Node } from 'react-virtualized-tree';
import { Loader } from 'components';

import {
  useAssetBreadcrumbsQuery,
  useAssetListQuery,
  useAssetRetrieveQuery,
} from './hooks';
import { AssetNodeWrapper } from './elements';
import { AssetNodeState, ViewMoreNodeState, TREE_UPDATE_TYPE } from './types';
import AssetNodeRenderer from './AssetNodeRenderer';

type AssetNodesById = Record<string | number, AssetNodeState>;

const mapAssetsById = (
  assets: Asset[] = [],
  knownIds: string[] = []
): AssetNodesById =>
  assets.reduce((acc: AssetNodesById, asset: Asset) => {
    // make sure the asset is not already in the list
    if (knownIds.includes(`${asset.id}`)) {
      return acc;
    }
    return {
      ...acc,
      [asset.id]: {
        asset,
        isLeaf: asset.aggregates ? !asset.aggregates.childCount : false,
      },
    };
  }, {} as AssetNodesById);

type AssetHierarchyProps = {
  rootNodes?: AssetIdEither[];
  selectedAssetId?: AssetIdEither;
  onSelect: (asset: Asset) => void;
};

const AssetHierarchy: React.FC<AssetHierarchyProps> = ({
  rootNodes,
  selectedAssetId: selectedAssetIdProp,
  onSelect,
}) => {
  const [isLoadingRootAssets, setIsLoadingRootAssets] = useState(false);
  const [rootIds, setRootIds] = useState<CogniteInternalId[]>([]);
  const [assetNodesById, setAssetNodesById] = useState<AssetNodesById>({});

  const [selectedAssetId, setSelectedAssetId] = useState<
    AssetIdEither | undefined
  >(selectedAssetIdProp);

  const [scrollToId, setScrollToId] = useState<number | undefined>();

  // get asset hierarchy only if asset has not been fetched before
  const selectedAssetHierarchyQuery = useAssetBreadcrumbsQuery(
    selectedAssetIdProp &&
      !assetNodesById[(selectedAssetIdProp as InternalId).id]
      ? selectedAssetIdProp
      : undefined,
    {
      aggregatedProperties: ['childCount'],
    }
  );

  // enabled when rootNodes is provided in props
  const retrieveRootAssetsQuery = useAssetRetrieveQuery(rootNodes, {
    aggregatedProperties: ['childCount'],
  });

  // enabled when rootNodes is not provided in props
  const listRootAssetsQuery = useAssetListQuery(
    rootNodes
      ? undefined
      : {
          filter: { root: true },
          aggregatedProperties: ['childCount'],
        }
  );

  // fetch asset children query
  const [assetIdToFetch, setAssetIdToFetch] = useState<
    CogniteInternalId | undefined
  >();
  const fetchAssetChilrenQuery = useAssetListQuery(
    assetIdToFetch
      ? {
          filter: { parentIds: [assetIdToFetch] },
          aggregatedProperties: ['childCount'],
          limit: 10,
        }
      : undefined
  );

  // fetch next asset children query
  const [nextChildrenToFetch, setNextChildrenToFetch] = useState<
    { id: CogniteInternalId; cursor: string | undefined } | undefined
  >();
  const fetchNextAssetChilrenQuery = useAssetListQuery(
    nextChildrenToFetch
      ? {
          filter: { parentIds: [nextChildrenToFetch.id] },
          aggregatedProperties: ['childCount'],
          limit: 100,
          cursor: nextChildrenToFetch.cursor,
        }
      : undefined
  );

  // save & expand selected asset after fetching selected asset hierarchy
  useEffect(() => {
    if (
      selectedAssetHierarchyQuery.isSuccess &&
      rootIds.length > 0 &&
      selectedAssetHierarchyQuery.data?.length
    ) {
      // first element is selected asset, last element is root asset
      const hierarchy = selectedAssetHierarchyQuery.data;

      const expandedAssetNodes = hierarchy.reduce(
        (acc, asset, index, srcArr) => {
          let childrenIds;
          let expanded: boolean | undefined;
          let isLeaf: boolean | undefined;
          // skip last child
          if (index > 0) {
            const childAsset = srcArr[index - 1];
            // remember child assets
            childrenIds = [childAsset.id];
            expanded = true;
          } else {
            // check if last child is a leaf
            isLeaf = asset.aggregates ? !asset.aggregates.childCount : false;
          }
          // add new asset node
          return {
            ...acc,
            [asset.id]: {
              asset,
              childrenIds,
              childrenExpanded: false,
              expanded,
              isLeaf,
            },
          };
        },
        {} as AssetNodesById
      );

      setAssetNodesById(prev => ({
        ...prev,
        ...expandedAssetNodes,
      }));
    }
  }, [selectedAssetHierarchyQuery.isSuccess, rootIds.length]);

  // expand to selected asset
  useEffect(() => {
    if (selectedAssetIdProp) {
      setSelectedAssetId({
        ...selectedAssetIdProp,
      });
      const { id } = selectedAssetIdProp as InternalId;
      const selectedNode = id && assetNodesById[id];
      if (selectedNode) {
        let nextParentToExpand: AssetNodeState | undefined = selectedNode.asset
          .parentId
          ? assetNodesById[selectedNode.asset.parentId]
          : undefined;
        while (nextParentToExpand) {
          nextParentToExpand.expanded = true;
          nextParentToExpand = nextParentToExpand.asset.parentId
            ? assetNodesById[nextParentToExpand.asset.parentId]
            : undefined;
        }

        // scroll to the asset
        setScrollToId(id);
        // and clear the property to avoid side effects
        setTimeout(() => setScrollToId(undefined), 200);
      }
    }
  }, [selectedAssetIdProp]);

  // handle root assets query
  useEffect(() => {
    const {
      data = [],
      isLoading,
      isError,
    } = !retrieveRootAssetsQuery.isIdle
      ? retrieveRootAssetsQuery
      : listRootAssetsQuery;

    if (isLoading) {
      setIsLoadingRootAssets(true);
      return;
    }

    if (isError) {
      setIsLoadingRootAssets(false);
      return;
    }

    const rootAssets = !listRootAssetsQuery.isIdle
      ? (data as ListResponse<Asset[]>).items
      : (data as Asset[]);

    setRootIds(
      rootAssets
        ?.slice()
        .sort((ast1, ast2) => ast1.name.localeCompare(ast2.name))
        .map(rootAsset => rootAsset.id)
    );
    setAssetNodesById(prevState => ({
      ...prevState,
      ...mapAssetsById(rootAssets),
    }));
    setIsLoadingRootAssets(false);
  }, [retrieveRootAssetsQuery.status, listRootAssetsQuery.status]);

  const handleAssetChildrenQueryResult = (
    query: UseQueryResult,
    assetId: CogniteInternalId
  ) => {
    const { data, isLoading, isError, error } = query;
    if (isLoading) {
      setAssetNodesById(prevState => ({
        ...prevState,
        [assetId]: {
          ...prevState[assetId],
          isLoadingChildren: true,
        },
      }));
      return;
    }

    if (isError || !data) {
      // eslint-disable-next-line no-console
      if (error) {
        console.error(error);
      }
      setAssetNodesById(prevState => ({
        ...prevState,
        [assetId]: {
          ...prevState[assetId],
          isLoadingChildren: false,
        },
      }));
      return;
    }

    const { items: childAssets, nextCursor } = data as ListResponse<Asset[]>;

    setAssetNodesById(prevState => {
      const knownAssetIds = Object.keys(prevState);
      const newChildAssetNodes = mapAssetsById(childAssets, knownAssetIds);

      const nextChildren = union(
        prevState[assetId].childrenIds || [],
        childAssets?.map(asset => asset.id) || []
      ).sort((id1, id2) =>
        (
          newChildAssetNodes[id1] || assetNodesById[id1]
        )?.asset.name.localeCompare(
          (newChildAssetNodes[id2] || assetNodesById[id2])?.asset.name
        )
      );

      return {
        ...prevState,
        // add new assets
        ...newChildAssetNodes,
        // update parent asset
        [assetId]: {
          ...prevState[assetId],
          childrenIds: nextChildren,
          childrenExpanded: true, // needed when expanding selected asset from props
          isLeaf: !nextChildren?.length,
          nextCursor,
          isLoadingChildren: false,
        },
      };
    });
  };

  // handle asset children query result
  useEffect(() => {
    if (!assetIdToFetch) {
      return;
    }
    handleAssetChildrenQueryResult(fetchAssetChilrenQuery, assetIdToFetch);
  }, [assetIdToFetch, fetchAssetChilrenQuery.status]);

  // handle next asset children result
  useEffect(() => {
    if (!nextChildrenToFetch) {
      return;
    }
    const { id } = nextChildrenToFetch;
    handleAssetChildrenQueryResult(fetchNextAssetChilrenQuery, id);
  }, [nextChildrenToFetch, fetchNextAssetChilrenQuery.status]);

  const onItemSelect = useCallback(
    async (assetInternalId: number) => {
      const assetNode = assetNodesById[assetInternalId];
      if (!assetNode) {
        return;
      }
      setSelectedAssetId({
        externalId: assetNode.asset.externalId,
        id: assetNode.asset.id,
      });
      onSelect(assetNode.asset);
    },
    [assetNodesById, setSelectedAssetId, onSelect]
  );

  const onItemExpand = useCallback(
    async (assetInternalId: CogniteInternalId) => {
      const assetNode = assetNodesById[assetInternalId];
      if (!assetNode) {
        return;
      }
      if (!assetNode.isLeaf && !assetNode.childrenExpanded) {
        // load asset children at first time
        setAssetIdToFetch(+assetInternalId);
      }
    },
    [assetNodesById, setAssetIdToFetch]
  );

  const loadMoreAssets = useCallback(
    async (parentNodeId: CogniteInternalId) => {
      const parentNode = assetNodesById[parentNodeId];
      const {
        asset: { id: assetInternalId },
        nextCursor,
      } = parentNode;

      // load more asset children
      setNextChildrenToFetch({ id: assetInternalId, cursor: nextCursor });
    },
    [assetNodesById, setNextChildrenToFetch]
  );

  const updateAssetNode = useCallback(
    (updatedNode?: AssetNodeState) => {
      if (!updatedNode) {
        return;
      }
      setAssetNodesById(prevState => ({
        ...prevState,
        [updatedNode.asset.id]: {
          ...updatedNode,
        },
      }));
    },
    [setAssetNodesById]
  );

  const treeSelectHandler = useCallback(
    (nodes: Node[], updatedNode: Node): Node[] => {
      onItemSelect(updatedNode.state?.asset.id);
      return nodes.map(node => {
        if (node.id === updatedNode.id) {
          return {
            ...updatedNode,
            state: {
              ...updatedNode.state,
              selected: true,
            },
          };
        }
        return {
          ...node,
          state: {
            ...node.state,
            selected: false,
          },
        };
      });
    },
    [onItemSelect]
  );

  const treeExpandCollapseHandler = useCallback(
    (nodes: Node[], updatedNode: Node): Node[] => {
      if (updatedNode.state?.expanded) {
        onItemExpand(updatedNode.state!.asset.id);
      }

      updateAssetNode(updatedNode.state as AssetNodeState);
      return nodes.map(node => {
        if (node.id === updatedNode.id) {
          return {
            ...node,
            state: { ...updatedNode.state },
          };
        }
        return { ...node };
      });
    },
    [onItemExpand, updateAssetNode]
  );

  const treeLoadMoreHandler = useCallback(
    (nodes: Node[], updatedNode: Node): Node[] => {
      const { parentId } = updatedNode.state || {};
      if (parentId) {
        loadMoreAssets(Number(parentId));
      }
      return nodes;
    },
    [loadMoreAssets]
  );

  const mapAssetNodeToTreeNode = (ids: number[], parent?: number): Node[] => {
    const treeNodes = ids.map(id => {
      const node = assetNodesById[id];
      const children = node.childrenIds
        ? (mapAssetNodeToTreeNode(node.childrenIds, id) as Node[])
        : [];
      return {
        id,
        name: node.asset.name,
        state: { ...node } as AssetNodeState | ViewMoreNodeState,
        children,
      };
    });

    // add view more elements
    const parentNode = parent ? assetNodesById[parent] : null;
    if (
      parentNode &&
      ((parentNode.childrenExpanded && parentNode.nextCursor) ||
        !parentNode.childrenExpanded)
    ) {
      // "view more" is just another node element in the end of the array with child elements
      treeNodes.push({
        id: Math.trunc(Math.random() * 1000000),
        name: 'View More',
        state: {
          viewMoreNode: true,
          parentId: parentNode.asset.id,
          isLoadingChildren: parentNode.isLoadingChildren,
        } as ViewMoreNodeState,
        children: [],
      });
    }
    return treeNodes;
  };

  const renderTree = () => {
    if (isLoadingRootAssets) {
      return <Loader />;
    }
    if (rootIds.length === 0) {
      return <p>No assets found</p>;
    }

    // eslint-disable-next-line @typescript-eslint/no-shadow
    const rootNodes = mapAssetNodeToTreeNode(rootIds);
    console.log('roots', rootNodes);

    return (
      <div style={{ height: '100%' }}>
        <Tree
          nodes={rootNodes}
          onChange={() => {}}
          nodeMarginLeft={12}
          scrollToId={scrollToId}
          extensions={{
            updateTypeHandlers: {
              [TREE_UPDATE_TYPE.SELECT]: treeSelectHandler,
              [TREE_UPDATE_TYPE.EXPAND_COLLAPSE]: treeExpandCollapseHandler,
              [TREE_UPDATE_TYPE.LOAD_MORE]: treeLoadMoreHandler,
            },
          }}
        >
          {props => (
            <div style={props.style}>
              <AssetNodeWrapper key={`node-${props.index}`}>
                <AssetNodeRenderer {...props} selectedId={selectedAssetId} />
              </AssetNodeWrapper>
            </div>
          )}
        </Tree>
      </div>
    );
  };

  return renderTree();
};

export default React.memo(AssetHierarchy);
