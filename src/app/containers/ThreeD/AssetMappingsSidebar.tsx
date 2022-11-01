import React, { Dispatch, SetStateAction, useState } from 'react';
import { Button, Flex, Input, Loader } from '@cognite/cogs.js';
import { AssetMappingsList } from 'app/containers/ThreeD/AssetMappingsList';
import { useMappedAssets } from 'app/containers/ThreeD/hooks';
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
  setSelectedAssetId: Dispatch<SetStateAction<number | undefined>>;
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

  const { data: mappedAssets, isFetched } = useMappedAssets(
    modelId,
    revisionId
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

  const isItemLoaded = (index: number) => {
    if (mappedAssets?.length) {
      return Boolean(index < mappedAssets?.length);
    }
    return true;
  };

  if (!isFetched) {
    return <Loader />;
  }
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
        />
        {expanded && (
          <Button
            icon="Close"
            onClick={() => {
              setExpanded(false);
              trackUsage('Exploration.Preview.AssetMapping');
            }}
          />
        )}
      </Flex>
      {expanded && (
        <AssetMappingsList
          query={query}
          assets={mappedAssets ?? []}
          selectedAssetId={selectedAssetId}
          onClick={e => {
            handleAssetClick(e);
            setExpanded(false);
            trackUsage('Exploration.Action.Select', { selectedAssetId });
          }}
          itemCount={mappedAssets?.length ?? 0}
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
