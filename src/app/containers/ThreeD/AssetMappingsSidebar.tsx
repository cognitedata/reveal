import React, { useState } from 'react';
import { Button, Input, Tooltip, Flex, Loader } from '@cognite/cogs.js';
import { AssetMappingsList } from 'app/containers/ThreeD/AssetMappingsList';
import { useAssetMappings } from 'app/containers/ThreeD/hooks';
import styled from 'styled-components';

type ThreeDSidebarProps = {
  modelId?: number;
  revisionId?: number;
  selectedAssetId: number | null;
  onClose: () => void;
  setSelectedAssetId: (assetId: number | null) => void;
};

export const AssetMappingsSidebar = ({
  modelId,
  revisionId,
  selectedAssetId,
  onClose,
  setSelectedAssetId,
}: ThreeDSidebarProps) => {
  const [query, setQuery] = useState('');

  const { data: assetListData, isFetched } = useAssetMappings(
    modelId,
    revisionId
  );

  const handleAssetClick = async (assetId: number) => {
    // Deselect current asset mappings
    if (assetId === selectedAssetId) {
      setSelectedAssetId(null);
    } else {
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
        <Flex direction="row" justifyContent="flex-end">
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
              placeholder="Search assets"
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
            loadMoreItems={() => {}}
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
  height: calc(100% - 85px);
  top: 85px;
  left: 0;
  z-index: 100;
  background: var(--cogs-white);
  overflow: hidden;
`;

const InputContainer = styled.div`
  margin: 10px 5px;
`;
