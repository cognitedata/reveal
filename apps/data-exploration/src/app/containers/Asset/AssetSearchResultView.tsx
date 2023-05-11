import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  StyledSplitter,
  SearchResultWrapper,
} from '@data-exploration-app/containers/elements';
import {
  AssetSearchResults,
  AssetViewMode,
} from '@data-exploration-components/containers';
import {
  useAssetFilters,
  useAssetViewState,
} from '@data-exploration-app/store';
import { trackUsage } from '@data-exploration-app/utils/Metrics';
import { EXPLORATION } from '@data-exploration-app/constants/metrics';
import { ResourceItem } from '@cognite/data-exploration';
import {
  useCurrentResourceId,
  useQueryString,
  useSelectedResourceId,
} from '@data-exploration-app/hooks/hooks';
import { useDebounce } from 'use-debounce';
import { SEARCH_KEY } from '@data-exploration-app/utils/constants';

import { AssetPreview } from '@data-exploration-app/containers/Asset/AssetPreview';
import { routes } from '@data-exploration-app/containers/App';
import { createLink } from '@cognite/cdf-utilities';
import { Asset } from '@cognite/sdk';
import { getSearchParams } from '@data-exploration-app/utils/URLUtils';

export const AssetSearchResultView = () => {
  const [assetView, setAssetView] = useAssetViewState();
  const [, openPreview] = useCurrentResourceId();
  const [query] = useQueryString(SEARCH_KEY);
  const [debouncedQuery] = useDebounce(query, 100);
  const [assetFilter, setAssetFilter] = useAssetFilters();
  const navigate = useNavigate();
  const location = useLocation();

  // Here we need to parse params to find selected asset's id.
  const selectedAssetId = useSelectedResourceId();

  const handleViewChange = (nextView: AssetViewMode) => {
    setAssetView(nextView);
    trackUsage(EXPLORATION.CLICK.TOGGLE_ASSET_TABLE_VIEW, { view: nextView });
  };

  const handleRowClick = <T extends Omit<ResourceItem, 'type'>>(item: T) => {
    openPreview(item.id !== selectedAssetId ? item.id : undefined);
  };

  const handleShowAllAssetsClick = (item: Asset) => {
    if (item.parentId) {
      const search = getSearchParams(location.search);
      navigate(
        createLink(`/explore/search/asset/${item.parentId}/children`, search)
      );
    }
  };

  return (
    <StyledSplitter
      primaryMinSize={420}
      secondaryInitialSize={700}
      primaryIndex={0}
    >
      <SearchResultWrapper>
        <AssetSearchResults
          isTreeEnabled
          showCount
          view={assetView}
          onViewChange={handleViewChange}
          filter={assetFilter}
          onClick={handleRowClick}
          onShowAllAssetsClick={handleShowAllAssetsClick}
          onFilterChange={(newValue: Record<string, unknown>) =>
            setAssetFilter(newValue)
          }
          query={debouncedQuery}
          activeIds={selectedAssetId ? [selectedAssetId] : []}
        />
      </SearchResultWrapper>

      {Boolean(selectedAssetId) && (
        <SearchResultWrapper>
          <Routes>
            <Route
              path={routes.viewDetail.path}
              element={<AssetPreview assetId={selectedAssetId!} />}
            />
            <Route
              path={routes.viewDetailTab.path}
              element={<AssetPreview assetId={selectedAssetId!} />}
            />
          </Routes>
        </SearchResultWrapper>
      )}
    </StyledSplitter>
  );
};
