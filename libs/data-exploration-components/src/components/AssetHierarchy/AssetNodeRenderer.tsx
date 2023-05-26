import React, { useEffect } from 'react';
import {
  CustomRendererProps,
  FlattenedNode,
  selectors,
} from 'react-virtualized-tree';

import { A, Icon } from '@cognite/cogs.js';
import { Asset, AssetIdEither } from '@cognite/sdk';

import { TREE_UPDATE_TYPE } from './types';

export const updateNodeState = (
  originalNode: FlattenedNode,
  newState: { [stateKey: string]: any }
): FlattenedNode => ({
  ...originalNode,
  state: {
    ...originalNode.state,
    ...newState,
  },
});

const { getNodeRenderOptions } = selectors;

const isSelectedAsset = (
  asset: Asset,
  selectedAssetId: AssetIdEither
): boolean => {
  const { id: selectedId, externalId: selectedExternalId } =
    selectedAssetId as any;
  return (
    (selectedExternalId && selectedExternalId === asset.externalId) ||
    (selectedId && selectedId === asset.id)
  );
};

type AssetNodeRendererProps = CustomRendererProps<any> & {
  node: FlattenedNode;
  children?: React.ReactNode;
  selectedId?: AssetIdEither;
};

const AssetNodeRenderer: React.FC<AssetNodeRendererProps> = ({
  node,
  children: childrenNodes,
  onChange,
  selectedId,
  measure,
}) => {
  const { isExpanded } = getNodeRenderOptions(node);
  const isSelected = (asset: Asset) =>
    selectedId ? isSelectedAsset(asset, selectedId) : false;

  useEffect(() => {
    measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExpand = () => {
    onChange({
      node: updateNodeState(node, { expanded: !isExpanded }),
      type: `${TREE_UPDATE_TYPE.EXPAND_COLLAPSE}`,
    });
  };

  const handleSelect = () => {
    onChange({ node, type: `${TREE_UPDATE_TYPE.SELECT}` });
  };

  const renderName = (asset: Asset, tabIndex = 0) => (
    <div
      className={`node-name ${isSelected(asset) ? 'selected' : ''}`}
      key={asset.id}
      onClick={handleSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          handleSelect();
        }
      }}
      role="button"
      tabIndex={tabIndex}
    >
      {asset.name}
    </div>
  );

  const renderAssetLoading = (asset: Asset) => (
    <div
      className={`node-item-header node-name node-icon loading-icon ${
        isSelected(asset) ? 'selected' : ''
      }`}
      key={asset.id}
    >
      <Icon type="Loader" size={14} />
      {asset.name}
    </div>
  );

  const renderViewMore = (currentNode: FlattenedNode | undefined) => {
    if (!currentNode) {
      return null;
    }
    if (currentNode.state?.isLoadingChildren) {
      return (
        <p className="node-name node-icon loading-icon">
          <Icon type="Loader" size={14} />
        </p>
      );
    }
    return (
      <p className="node-name">
        <A
          type="link"
          onClick={() => {
            onChange({
              node: currentNode,
              type: `${TREE_UPDATE_TYPE.LOAD_MORE}`,
            });
          }}
        >
          View More
        </A>
      </p>
    );
  };

  if (!node) {
    // eslint-disable-next-line no-console
    console.error(
      `TreeNode not found` // should not get here!
    );
    return null;
  }

  const {
    children,
    state: { asset, isLeaf, isLoadingChildren, viewMoreNode } = {},
    deepness,
  } = node;

  if (viewMoreNode) {
    return renderViewMore(node);
  }

  if (isLeaf) {
    // render as a leaf
    return <div className="node-item">{renderName(asset, deepness)}</div>;
  }
  if (isLoadingChildren && !children?.length) {
    // asset is loading
    return <div className="node-item">{renderAssetLoading(asset)}</div>;
  }

  return (
    // render as expandable item
    <div className="node-item" onDoubleClick={handleExpand}>
      <span
        className="node-item-header node-icon"
        tabIndex={deepness}
        onClick={handleExpand}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleExpand();
          }
        }}
      >
        <Icon type={`Chevron${isExpanded ? 'Down' : 'Right'}Small`} />
        {renderName(asset, deepness)}

        {isExpanded ? childrenNodes : null}
      </span>
    </div>
  );
};

export default React.memo(AssetNodeRenderer);
