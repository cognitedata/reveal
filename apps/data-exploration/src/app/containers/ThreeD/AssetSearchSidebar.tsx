import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';

import styled from 'styled-components';

import { Button, Flex, Input } from '@cognite/cogs.js';
import {
  Cognite3DViewer,
  CogniteModel,
  Image360Collection,
} from '@cognite/reveal';
import { Asset } from '@cognite/sdk';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';

import { useTranslation } from '@data-exploration-lib/core';

import { EXPLORATION } from '../../constants/metrics';
import { trackUsage } from '../../utils/Metrics';

import { AssetMappingsList } from './AssetMappingsList';
import { AugmentedMapping, useInfiniteAssetMappings } from './hooks';

type ThreeDSidebarProps = {
  modelId?: number;
  revisionId?: number;
  selectedAssetId?: number;
  setSelectedAssetId: (assetId?: number) => void;
  viewer: Cognite3DViewer;
  threeDModel?: CogniteModel | Image360Collection;
};

export const AssetSearchSidebar = ({
  modelId,
  revisionId,
  selectedAssetId,
  setSelectedAssetId,
  threeDModel,
}: ThreeDSidebarProps) => {
  const { t } = useTranslation();

  const { data: asset } = useCdfItem<Asset>(
    'assets',
    { id: selectedAssetId! },
    { enabled: Number.isFinite(selectedAssetId) }
  );
  const isMac = useMemo(() => /Macintosh/.test(window.navigator.userAgent), []);

  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);

  const {
    error,
    data,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isFetching,
  } = useInfiniteAssetMappings(modelId, revisionId, threeDModel);

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

  const handleAssetClick = (clickedAssetId: number) => {
    setSelectedAssetId(clickedAssetId);
  };

  const searchRef = useRef<HTMLInputElement>(null);

  const keyEventHandler = useCallback(
    function (e: KeyboardEvent) {
      const meta = isMac ? 'metaKey' : 'ctrlKey';
      if (e.key === 'k' && e[meta]) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    },
    [isMac]
  );

  useEffect(() => {
    window.addEventListener('keydown', keyEventHandler);
    return () => window.removeEventListener('keydown', keyEventHandler);
  }, [keyEventHandler]);

  return (
    <SidebarContainer
      expanded={expanded}
      onFocus={() => {
        setExpanded(true);
        trackUsage(EXPLORATION.THREED_ACTION.ASSET_LIST_SELECT, {
          resourceType: '3D',
        });
      }}
    >
      <Flex gap={5} justifyContent="flex-end" alignItems="center">
        <StyledInput
          onKeyUp={(e) => {
            if (e.key === 'Escape' && expanded) {
              setQuery('');
              setExpanded(false);
              searchRef.current?.blur();
            }
          }}
          ref={searchRef}
          id="search"
          style={{ flexGrow: 1 }}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            trackUsage(EXPLORATION.THREED_ACTION.ASSET_SEARCH, {
              name: query,
              resourceType: '3D',
            });
          }}
          placeholder={
            asset?.name ||
            t('SEARCH', `Search (${isMac ? '⌘' : 'Ctrl'} + K)`, {
              context: isMac ? 'mac' : 'windows',
            })
          }
          fullWidth
          size="large"
          iconPlacement="left"
          icon={isFetching || hasNextPage ? 'Loader' : 'Search'}
          autoComplete="off"
        />
        {expanded && (
          <StyledButton
            aria-label="close-asset-mappings-button"
            onClick={() => {
              if (query) {
                setQuery('');
              } else {
                setExpanded(false);
              }
              trackUsage(EXPLORATION.THREED_ACTION.ASSET_PREVIEW_CLOSE, {
                resourceType: '3D',
              });
            }}
          >
            {query ? t('CLEAR', 'Clear') : t('CLOSE', 'Close')}
          </StyledButton>
        )}
      </Flex>

      {expanded && (
        <AssetMappingsList
          error={error}
          query={query}
          assets={items ?? []}
          selectedAssetId={selectedAssetId}
          onClick={(e) => {
            handleAssetClick(e);
            setExpanded(false);
            trackUsage(EXPLORATION.THREED_ACTION.ASSET_SELECTED, {
              selectedAssetId,
              resourceType: '3D',
            });
          }}
          itemCount={items?.length ?? 0}
          isItemLoaded={(i) => i < (items?.length || 0)}
        />
      )}
    </SidebarContainer>
  );
};

const SidebarContainer = styled.div<{ expanded?: boolean }>`
  height: ${(props) => (props.expanded ? '400px' : 'initial')};
  background: ${(props) => (props.expanded ? ' var(--cogs-white)' : 'initial')};
  border-radius: 4px;
  overflow: hidden;
`;

const StyledButton = styled(Button)`
  position: absolute;
  background: white;
  margin-right: 5px;
  &:hover {
    background: white;
  }
`;

const StyledInput = styled(Input)`
  height: 50px;
  border-radius: 4px;
  .cogs-input {
    border: none;
    width: 260px;
    &:focus {
      outline: none;
      border: none;
      border-bottom-right-radius: 0;
      border-bottom-left-radius: 0;
    }
  }
  .cogs-input.with-icon-left {
    padding-left: 43px;
  }
  .cogs-input:hover {
    border: none;
  }
`;
