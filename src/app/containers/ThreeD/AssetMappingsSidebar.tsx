import React, { useState } from 'react';
import { Button, Input, Title, Tooltip, Flex, Loader } from '@cognite/cogs.js';
import {
  AssetNodeCollection,
  Cognite3DModel,
  Cognite3DViewer,
  DefaultNodeAppearance,
  NodeOutlineColor,
} from '@cognite/reveal';
import { useSDK } from '@cognite/sdk-provider';
import { AssetMappingsList } from 'app/containers/ThreeD/AssetMappingsList';
import { use3DModel, useAssetMappings } from 'app/containers/ThreeD/hooks';
import { ExpandButton, HomeButton } from 'app/containers/ThreeD/ThreeDToolbar';
import {
  getAssetMappingsByAssetId,
  selectAssetBoundingBox,
} from 'app/containers/ThreeD/utils';
import styled from 'styled-components';

type ThreeDSidebarProps = {
  viewer: Cognite3DViewer | null;
  viewerModel: Cognite3DModel | null;
  modelId?: number;
  revisionId?: number;
  selectedAssetId: number | null;
  onClose: () => void;
  setSelectedAssetId: (assetId: number | null) => void;
};

export const AssetMappingsSidebar = ({
  modelId,
  revisionId,
  viewer,
  viewerModel,
  selectedAssetId,
  onClose,
  setSelectedAssetId,
}: ThreeDSidebarProps) => {
  const [query, setQuery] = useState('');

  const sdk = useSDK();
  const { data: model } = use3DModel(modelId);

  const { data: assetListData, isFetched } = useAssetMappings(
    modelId,
    revisionId
  );

  const handleAssetClick = async (assetId: number) => {
    // Deselect current asset mappings
    if (assetId === selectedAssetId) {
      setSelectedAssetId(null);

      if (viewerModel) {
        viewerModel.removeAllStyledNodeCollections();
        viewerModel.setDefaultNodeAppearance(DefaultNodeAppearance.Default);
      }
      return;
    }

    if (viewer && viewerModel) {
      // Style related nodes
      const assetNodes = new AssetNodeCollection(sdk, viewerModel);
      assetNodes.executeFilter({ assetId });

      viewerModel.removeAllStyledNodeCollections();
      viewerModel.setDefaultNodeAppearance(DefaultNodeAppearance.Ghosted);
      viewerModel.assignStyledNodeCollection(assetNodes, {
        renderGhosted: false,
        outlineColor: NodeOutlineColor.Cyan,
      });

      // Zoom in to view
      const mappings = await getAssetMappingsByAssetId(
        sdk,
        modelId,
        revisionId,
        [assetId]
      );
      const boundingBox = await selectAssetBoundingBox(mappings, viewerModel);
      if (boundingBox) {
        viewer.fitCameraToBoundingBox(boundingBox);
      }

      setSelectedAssetId(assetId);
    }
  };

  const isItemLoaded = (index: number) => {
    if (assetListData?.length) {
      return Boolean(index < assetListData?.length);
    }
    return true;
  };

  return (
    <SidebarContainer>
      <SidebarHeader>
        <Title level={4} style={{ marginBottom: 15 }}>
          {model?.name}
        </Title>
        <Flex direction="row" justifyContent="flex-end">
          <HomeButton />
          <ExpandButton viewer={viewer} viewerModel={viewerModel} />
          <Tooltip content="Hide">
            <Button icon="PanelLeft" onClick={onClose} aria-label="Hide" />
          </Tooltip>
        </Flex>
      </SidebarHeader>
      {isFetched ? (
        <>
          <InputContainer>
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Filter assets"
              fullWidth
            />
          </InputContainer>
          <AssetMappingsList
            query={query}
            assets={assetListData ?? []}
            selectedAssetId={selectedAssetId}
            onClick={handleAssetClick}
            itemCount={assetListData?.length ?? 0}
            isItemLoaded={isItemLoaded}
            loadMoreItems={() => { }}
          />
        </>
      ) : (
        <Loader />
      )}
    </SidebarContainer>
  );
};

const SidebarHeader = styled.div`
  padding: 10px;
  margin: 10px 0;
  border-bottom: 1px solid #e8e8e8;

  button {
    margin-right: 5px;
  }
`;

const SidebarContainer = styled.div`
  position: absolute;
  width: 300px;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 100;
  background: var(--cogs-white);
  overflow: hidden;
`;

const InputContainer = styled.div`
  margin: 10px 5px;
`;
