import {
  Asset,
  AssetIdEither,
  CogniteExternalId,
  CogniteInternalId,
  ListResponse,
} from '@cognite/sdk';
import React, { useContext, useEffect, useState } from 'react';
import { A, Collapse, Icon } from '@cognite/cogs.js';
import { CogniteSDKContext } from 'providers/CogniteSDKProvider';
import Loading from 'components/utils/Loading';
import {
  useAssetListQuery,
  useAssetRetrieveQuery,
} from 'hooks/useQuery/useAssetQuery';
import { UseQueryResult } from 'react-query';

import { TreeNodeWrapper } from './elements';
import { AssetNode } from './types';

type AssetNodesById = Record<string | number, AssetNode>;
const mapAssetsById = (assets: Asset[] = []): AssetNodesById =>
  assets.reduce(
    (acc: AssetNodesById, asset: Asset) => ({
      ...acc,
      [asset.id]: {
        asset,
        isLeaf: asset.aggregates ? !asset.aggregates.childCount : false,
      },
    }),
    {} as AssetNodesById
  );

type AssetHierarchyProps = {
  rootNodes?: AssetIdEither[];
  selectedAssetId?: AssetIdEither;
  onSelect: (nextAssetId: CogniteExternalId) => void;
};

const AssetHierarchy: React.FC<AssetHierarchyProps> = ({
  rootNodes,
  selectedAssetId: selectedAssetIdProp,
  onSelect,
}) => {
  const { client } = useContext(CogniteSDKContext);
  const [isLoadingRootAssets, setIsLoadingRootAssets] = useState(false);
  const [rootIds, setRootIds] = useState<CogniteInternalId[]>([]);
  const [assetNodesById, setAssetNodesById] = useState<AssetNodesById>({});
  const [selectedAssetId, setSelectedAssetId] = useState<
    AssetIdEither | undefined
  >(selectedAssetIdProp);

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

  // handle root assets query
  useEffect(() => {
    const { data, isLoading, isError, error } = !retrieveRootAssetsQuery.isIdle
      ? retrieveRootAssetsQuery
      : listRootAssetsQuery;

    if (isLoading) {
      setIsLoadingRootAssets(true);
      return;
    }

    if (isError) {
      setIsLoadingRootAssets(false);
      // eslint-disable-next-line no-console
      console.error(error);
      return;
    }

    const rootAssets = !listRootAssetsQuery.isIdle
      ? (data as ListResponse<Asset[]>).items
      : (data as Asset[]);

    setRootIds(rootAssets?.map((rootAsset) => rootAsset.id));
    setAssetNodesById((prevState) => ({
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
      setAssetNodesById((prevState) => ({
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
      error && console.error(error);
      setAssetNodesById((prevState) => ({
        ...prevState,
        [assetId]: {
          ...prevState[assetId],
          isLoadingChildren: false,
        },
      }));
      return;
    }

    const { items: childAssets, nextCursor } = data as ListResponse<Asset[]>;

    setAssetNodesById((prevState) => {
      const nextChildren = (prevState[assetId].children || []).concat(
        childAssets?.map((asset) => asset.id) || []
      );
      return {
        ...prevState,
        // add new assets
        ...mapAssetsById(childAssets),
        // update parent asset
        [assetId]: {
          ...prevState[assetId],
          children: nextChildren,
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

  const isSelectedAsset = (asset: Asset): boolean => {
    const { id, externalId } = selectedAssetId || ({} as any);
    return (
      (externalId && externalId === asset.externalId) || (id && id === asset.id)
    );
  };

  const onItemSelect = async (assetInternalId: string) => {
    const assetNode = assetNodesById[assetInternalId];
    if (!assetNode) {
      return;
    }
    setSelectedAssetId({
      externalId: assetNode.asset.externalId,
      id: assetNode.asset.id,
    });
    onSelect(assetNode.asset.externalId || '');

    if (!assetNode.isLeaf && !assetNode.children) {
      // load asset children
      setAssetIdToFetch(+assetInternalId);
    }
  };

  const loadMoreAssets = async (parentNode: AssetNode) => {
    const {
      asset: { id: assetInternalId },
      nextCursor,
    } = parentNode;

    // load more asset children
    setNextChildrenToFetch({ id: assetInternalId, cursor: nextCursor });
  };

  const renderLeaf = (asset: Asset, tabIndex = 0) => (
    <div
      className={`leaf-item ${isSelectedAsset(asset) ? 'selected' : ''}`}
      key={asset.id}
      onClick={() => onItemSelect(`${asset.id}`)}
      onKeyDown={(e) => {
        e.key === 'Enter' && onItemSelect(`${asset.id}`);
      }}
      role="button"
      tabIndex={tabIndex}
    >
      {asset.name}
    </div>
  );

  const renderAssetLoading = (asset: Asset) => (
    <div
      className={`leaf-item loading-asset ${
        isSelectedAsset(asset) ? 'selected' : ''
      }`}
      key={asset.id}
    >
      <Icon type="Loader" className="loading-icon" size={14} />
      {asset.name}
    </div>
  );

  const renderViewMore = (node: AssetNode | undefined) => {
    if (!node || !node.nextCursor) {
      return null;
    }
    if (node.isLoadingChildren) {
      return (
        <p className="leaf-item">
          <Icon type="Loader" size={14} />
        </p>
      );
    }
    return (
      <p className="leaf-item">
        <A
          type="link"
          onClick={() => {
            loadMoreAssets(node);
          }}
        >
          View More
        </A>
      </p>
    );
  };

  const renderTreeNode = (nodeIds: number[], parentNode?: AssetNode) =>
    !nodeIds || nodeIds.length === 0 ? null : (
      <Collapse accordion ghost onChange={onItemSelect}>
        <>
          {nodeIds.map((assetId, index) => {
            const node = assetNodesById[assetId];
            if (!node) {
              // eslint-disable-next-line no-console
              console.error(
                `TreeNode not found for assetId=${assetId}` // should not get here!
              );
              return null;
            }
            const { children, asset, isLeaf, isLoadingChildren } = node;
            if (isLeaf) {
              // render as a leaf
              return renderLeaf(asset, index);
            }
            if (isLoadingChildren && !children?.length) {
              // asset is loading
              return renderAssetLoading(asset);
            }
            return (
              // render as expandable item
              <Collapse.Panel
                header={asset.name}
                key={asset.id}
                className={isSelectedAsset(asset) ? 'selected' : ''}
              >
                {children ? renderTreeNode(children, node) : null}
              </Collapse.Panel>
            );
          })}
          {renderViewMore(parentNode)}
        </>
      </Collapse>
    );

  const renderRootAssets = () => {
    if (isLoadingRootAssets) {
      return <Loading />;
    }
    if (rootIds.length === 0) {
      return <p>No assets found</p>;
    }
    return <TreeNodeWrapper>{renderTreeNode(rootIds)}</TreeNodeWrapper>;
  };

  return renderRootAssets();
};

export default React.memo(AssetHierarchy);
