import React, { useState } from 'react';
import { Button, Flex, Input, Loader } from '@cognite/cogs.js';
import { AssetMappingsList } from 'app/containers/ThreeD/AssetMappingsList';
import { useAssetMappings } from 'app/containers/ThreeD/hooks';
import styled from 'styled-components';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { Asset } from '@cognite/sdk';

type ThreeDSidebarProps = {
  modelId?: number;
  revisionId?: number;
  selectedAssetId: number | null;

  setSelectedAssetId: (assetId: number | null) => void;
};

export const AssetMappingsSidebar = ({
  modelId,
  revisionId,
  selectedAssetId,
  setSelectedAssetId,
}: ThreeDSidebarProps) => {
  const { data: asset } = useCdfItem<Asset>(
    'assets',
    { id: selectedAssetId! },
    { enabled: Number.isFinite(selectedAssetId) }
  );

  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);

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

  if (!isFetched) {
    return <Loader />;
  }
  return (
    <SidebarContainer expanded={expanded} onFocus={() => setExpanded(true)}>
      <Flex gap={5}>
        <Input
          style={{ flexGrow: 1 }}
          value={query}
          onChange={e => {
            setQuery(e.target.value);
          }}
          placeholder={asset?.name || 'Search assets'}
          fullWidth
        />
        {expanded && <Button icon="Close" onClick={() => setExpanded(false)} />}
      </Flex>
      {expanded && (
        <AssetMappingsList
          query={query}
          assets={assetListData ?? []}
          selectedAssetId={selectedAssetId}
          onClick={e => {
            handleAssetClick(e);
            setExpanded(false);
          }}
          itemCount={assetListData?.length ?? 0}
          isItemLoaded={isItemLoaded}
          loadMoreItems={() => {}}
        />
      )}
    </SidebarContainer>
  );
};

const SidebarContainer = styled.div<{ expanded?: boolean }>`
  height: ${props => (props.expanded ? '400px' : 'initial')};
  background: ${props => (props.expanded ? ' var(--cogs-white)' : 'initial')};
  overflow: hidden;
`;
