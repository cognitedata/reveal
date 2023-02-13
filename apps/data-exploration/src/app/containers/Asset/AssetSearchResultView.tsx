import { useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
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
import { useFlagAdvancedFilters } from '@data-exploration-app/hooks';
import { ResourceItem } from '@cognite/data-exploration';
import {
  useCurrentResourceId,
  useQueryString,
  useQueryStringArray,
  useSelectedResourceId,
} from '@data-exploration-app/hooks/hooks';
import { useDebounce } from 'use-debounce';
import { CART_KEY, SEARCH_KEY } from '@data-exploration-app/utils/constants';
import ResourceSelectionContext from '@data-exploration-app/context/ResourceSelectionContext';
import { AssetPreview } from '@data-exploration-app/containers/Asset/AssetPreview';
import { routes } from '@data-exploration-app/containers/App';

export const AssetSearchResultView = () => {
  const isAdvancedFiltersEnabled = useFlagAdvancedFilters();
  const [assetView, setAssetView] = useAssetViewState();
  const [, openPreview] = useCurrentResourceId();
  const [query] = useQueryString(SEARCH_KEY);
  const [debouncedQuery] = useDebounce(query, 100);
  const [assetFilter, setAssetFilter] = useAssetFilters();

  // Here we need to parse params to find selected asset's id.
  const selectedAssetId = useSelectedResourceId();

  const handleViewChange = (nextView: AssetViewMode) => {
    setAssetView(nextView);
    trackUsage(EXPLORATION.CLICK.TOGGLE_ASSET_TABLE_VIEW, { view: nextView });
  };

  const handleRowClick = <T extends Omit<ResourceItem, 'type'>>(item: T) => {
    openPreview(item.id !== selectedAssetId ? item.id : undefined);
  };

  // TODO: Do we need cart and onSelect and selection context?
  const [rawCart, setCart] = useQueryStringArray(CART_KEY, false);
  const cart = rawCart
    .map((s) => parseInt(s, 10))
    .filter((n) => Number.isFinite(n));

  const onSelect = (item: ResourceItem) => {
    const newCart = cart.includes(item.id)
      ? cart.filter((id) => id !== item.id)
      : cart.concat([item.id]);
    setCart(newCart);
  };

  const { mode } = useContext(ResourceSelectionContext);
  const isSelected = (item: ResourceItem) => cart.includes(item.id);

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
          enableAdvancedFilters={isAdvancedFiltersEnabled}
          onClick={handleRowClick}
          onFilterChange={(newValue: Record<string, unknown>) =>
            setAssetFilter(newValue)
          }
          query={debouncedQuery}
          onSelect={onSelect}
          selectionMode={mode}
          isSelected={isSelected}
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
