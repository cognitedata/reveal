import { Routes, Route } from 'react-router-dom';

import { SequenceSearchResults } from '@data-exploration/containers';
import { useDebounce } from 'use-debounce';

import { ResourceItem, ResourceTypes } from '@cognite/data-exploration';
import { Asset } from '@cognite/sdk';

import { routes } from '@data-exploration-app/containers/App';
import { AssetPreview } from '@data-exploration-app/containers/Asset/AssetPreview';
import {
  StyledSplitter,
  SearchResultWrapper,
} from '@data-exploration-app/containers/elements';
import { SequencePreview } from '@data-exploration-app/containers/Sequence/SequencePreview';
import {
  useCurrentResourceId,
  useQueryString,
  useSelectedResourceId,
} from '@data-exploration-app/hooks/hooks';
import { useSequenceFilters } from '@data-exploration-app/store';
import { SEARCH_KEY } from '@data-exploration-app/utils/constants';

export const SequenceSearchResultView = () => {
  const [, openPreview] = useCurrentResourceId();
  const [sequenceFilter, setSequenceFilter] = useSequenceFilters();
  const [query] = useQueryString(SEARCH_KEY);
  const [debouncedQuery] = useDebounce(query, 100);

  // Here we need to parse params to find selected sequence's id.
  const selectedSequenceId = useSelectedResourceId();
  const selectedRootAssetId = useSelectedResourceId(true);

  const selectedRow = selectedSequenceId ? { [selectedSequenceId]: true } : {};

  const handleRowClick = <T extends Omit<ResourceItem, 'type'>>(item: T) => {
    openPreview(item.id);
  };

  const handleRootAssetClick = (rootAsset: Asset, resourceId?: number) => {
    openPreview(resourceId, false, ResourceTypes.Asset, rootAsset.id);
  };

  return (
    <StyledSplitter
      primaryMinSize={420}
      secondaryInitialSize={700}
      primaryIndex={0}
    >
      <SearchResultWrapper>
        <SequenceSearchResults
          showCount
          selectedRow={selectedRow}
          onClick={handleRowClick}
          onRootAssetClick={handleRootAssetClick}
          onFilterChange={(newValue: Record<string, unknown>) =>
            setSequenceFilter(newValue)
          }
          filter={sequenceFilter}
          query={debouncedQuery}
        />
      </SearchResultWrapper>

      {Boolean(selectedSequenceId) && (
        <SearchResultWrapper>
          <Routes>
            <Route
              path={routes.viewDetail.path}
              element={<SequencePreview sequenceId={selectedSequenceId!} />}
            />
            <Route
              path={routes.viewDetailTab.path}
              element={<SequencePreview sequenceId={selectedSequenceId!} />}
            />
            <Route
              path={routes.viewAssetDetail.path}
              element={<AssetPreview assetId={selectedRootAssetId!} />}
            />
            <Route
              path={routes.viewAssetDetailTab.path}
              element={<AssetPreview assetId={selectedRootAssetId!} />}
            />
          </Routes>
        </SearchResultWrapper>
      )}
    </StyledSplitter>
  );
};
