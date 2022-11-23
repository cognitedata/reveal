import React, { useMemo, useState, useEffect } from 'react';
import { Button, Flex, Input } from '@cognite/cogs.js';
import { AssetMappingsList } from 'app/containers/ThreeD/AssetMappingsList';
import {
  AugmentedMapping,
  useInfiniteAssetMappings,
} from 'app/containers/ThreeD/hooks';
import styled from 'styled-components';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { Asset } from '@cognite/sdk';
import { trackUsage } from 'app/utils/Metrics';
import {
  fitCameraToAsset,
  highlightAsset,
  removeAllStyles,
} from 'app/containers/ThreeD/utils';
import { useSDK } from '@cognite/sdk-provider';
import { useQueryClient } from 'react-query';
import { Cognite3DModel, Cognite3DViewer } from '@cognite/reveal';

type ThreeDSidebarProps = {
  modelId: number;
  revisionId: number;
  selectedAssetId?: number;
  setSelectedAssetId: (assetId?: number) => void;
  viewer: Cognite3DViewer;
  threeDModel: Cognite3DModel;
};

export const AssetMappingsSidebar = ({
  modelId,
  revisionId,
  selectedAssetId,
  setSelectedAssetId,
  viewer,
  threeDModel,
}: ThreeDSidebarProps) => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  const { data: asset } = useCdfItem<Asset>(
    'assets',
    { id: selectedAssetId! },
    { enabled: Number.isFinite(selectedAssetId) }
  );

  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);

  const {
    error,
    data,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isFetching,
  } = useInfiniteAssetMappings(modelId, revisionId, 1000);

  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const items = useMemo(
    () =>
      data?.pages
        .reduce((accl, p) => [...accl, ...p.items], [] as AugmentedMapping[])
        .sort((a, b) => a.assetName.localeCompare(b.assetName)),
    [data?.pages]
  );

  const handleAssetClick = async (clickedAssetId: number) => {
    if (clickedAssetId !== selectedAssetId) {
      highlightAsset(sdk, threeDModel, clickedAssetId);
      fitCameraToAsset(
        sdk,
        queryClient,
        viewer,
        threeDModel,
        modelId,
        revisionId,
        clickedAssetId
      );
      setSelectedAssetId(clickedAssetId);
    } else {
      removeAllStyles(threeDModel);
      setSelectedAssetId(undefined);
    }
  };

  return (
    <SidebarContainer
      expanded={expanded}
      onFocus={() => {
        setExpanded(true);
        trackUsage('Exploration.Preview.AssetMapping');
      }}
    >
      <Flex gap={5}>
        <Input
          style={{ flexGrow: 1 }}
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            trackUsage('Exploration.Action.Search', { name: query });
          }}
          placeholder={asset?.name || 'Search assets'}
          fullWidth
          iconPlacement="right"
          icon={isFetching || hasNextPage ? 'Loader' : undefined}
        />
        {expanded && (
          <Button
            icon="Close"
            aria-label="close-asset-mappings-button"
            onClick={() => {
              setExpanded(false);
              trackUsage('Exploration.Preview.AssetMapping');
            }}
          />
        )}
      </Flex>
      {expanded && (
        <AssetMappingsList
          error={error}
          query={query}
          assets={items ?? []}
          selectedAssetId={selectedAssetId}
          onClick={e => {
            handleAssetClick(e);
            setExpanded(false);
            trackUsage('Exploration.Action.Select', { selectedAssetId });
          }}
          itemCount={items?.length ?? 0}
          isItemLoaded={i => i < (items?.length || 0)}
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
