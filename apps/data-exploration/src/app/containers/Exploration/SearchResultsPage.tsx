import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import { SearchConfigButton } from '@data-exploration/components';
import {
  AssetsTab,
  FilesTab,
  EventsTab,
  SearchConfig,
  SequenceTab,
  ThreeDTab,
  TimeseriesTab,
  ResourceTypeTabs as ResourceTypeTabsV2,
  ThreeDSearchContextProvider,
} from '@data-exploration/containers';
import styled from 'styled-components/macro';
import { useDebounce } from 'use-debounce';

import { PageTitle } from '@cognite/cdf-utilities';
import { Flex, Tabs } from '@cognite/cogs.js';
import { getTitle, ResourceType } from '@cognite/data-exploration';

import { useTranslation, ViewType } from '@data-exploration-lib/core';
import {
  useAssetsMetadataKeys,
  useTimeseriesMetadataKeys,
  useDocumentsMetadataKeys,
  useEventsMetadataKeys,
  useSequencesMetadataKeys,
} from '@data-exploration-lib/domain-layer';

import { GPTInfobar } from '../../components/GPTInfobar';
import { EXPLORATION } from '../../constants/metrics';
import { useResourceFilter } from '../../context/ResourceSelectionContext';
import {
  useFlagDocumentGPT,
  useFlagDocumentLabelsFilter,
  useFlagDocumentsApiEnabled,
} from '../../hooks';
import { useCurrentResourceType, useQueryString } from '../../hooks/hooks';
import {
  useAssetFilters,
  useCommonFilters,
  useEventsFilters,
  useFileFilters,
  useFilterSidebarState,
  useSequenceFilters,
  useTimeseriesFilters,
} from '../../store';
import { useDocumentFilters } from '../../store/filter/selectors/documentSelectors';
import { SEARCH_KEY } from '../../utils/constants';
import { trackUsage } from '../../utils/Metrics';
import { AllTab } from '../All';
import { routes } from '../App';
import { AssetSearchResultView } from '../Asset/AssetSearchResultView';
import { EventSearchResultView } from '../Event/EventSearchResultView';
import { FileSearchResultView } from '../File/FileSearchResultView';
import { SearchFiltersV2 } from '../SearchResults/SearchFiltersV2';
import { SequenceSearchResultView } from '../Sequence/SequenceSearchResultView';
import { ThreeDSearchResultView } from '../ThreeD/ThreeDSearchResultView';
import { TimeseriesSearchResultView } from '../Timeseries/TimeseriesSearchResultView';

import { BreakJourneyPrompt } from './BreakJourneyPrompt';
import { DetailsOverlay } from './DetailsOverlay';
import { ExplorationFilterToggle } from './ExplorationFilterToggle';
import { ExplorationSearchBar } from './ExplorationSearchBar';

const getPageTitle = (query: string, resourceType?: ResourceType): string => {
  return `${query}${query ? ' in' : ''} ${
    resourceType ? getTitle(resourceType, true) : 'All'
  }`;
};

function SearchPage() {
  // start fetching metadata keys as early as possible
  useAssetsMetadataKeys();
  useTimeseriesMetadataKeys();
  useDocumentsMetadataKeys();
  useEventsMetadataKeys();
  useSequencesMetadataKeys();

  const isDocumentsLabelsFilterEnabled = useFlagDocumentLabelsFilter();

  const [currentResourceType, setCurrentResourceType] =
    useCurrentResourceType();

  const [showFilter, setShowFilter] = useFilterSidebarState();
  const [query] = useQueryString(SEARCH_KEY);
  const [debouncedQuery] = useDebounce(query, 100);
  const [showSearchConfig, setShowSearchConfig] = useState<boolean>(false);

  const [assetFilter] = useAssetFilters();
  const [fileFilter] = useFileFilters();
  const [documentFilter] = useDocumentFilters();
  const [eventFilter] = useEventsFilters();
  const [timeseriesFilter] = useTimeseriesFilters();
  const [sequenceFilter] = useSequenceFilters();
  const [commonFilters] = useCommonFilters();

  const isDocumentGPTEnabled = useFlagDocumentGPT();
  const [showGPTInfo, setShowGPTInfo] = useState<boolean>(true);

  const { t } = useTranslation();
  const isDocumentsApiEnabled = useFlagDocumentsApiEnabled();

  const handleFilterToggleClick = React.useCallback(() => {
    setShowFilter((prevState) => {
      trackUsage(EXPLORATION.CLICK.TOGGLE_FILTERS_VIEW, {
        tab: currentResourceType,
        showFilters: !prevState,
      });
      return !prevState;
    }); // eslint-disable-next-line
  }, [setShowFilter]);

  return (
    <RootHeightWrapper>
      <SearchFiltersWrapper>
        <SearchFiltersV2
          enableDocumentLabelsFilter={isDocumentsLabelsFilterEnabled}
          resourceType={currentResourceType}
          visible={currentResourceType !== 'threeD' && showFilter}
        />
      </SearchFiltersWrapper>

      <MainSearchContainer>
        {isDocumentGPTEnabled &&
          currentResourceType === 'file' &&
          showGPTInfo && <GPTInfobar onClose={() => setShowGPTInfo(false)} />}
        <SearchInputContainer>
          {currentResourceType !== 'threeD' && (
            <>
              <ExplorationFilterToggle
                filterState={showFilter}
                onClick={handleFilterToggleClick}
              />
              <VerticalDivider />
            </>
          )}
          <SearchConfigButton
            style={{ marginRight: '2px' }}
            onClick={() => {
              setShowSearchConfig(true);
            }}
          />

          <ExplorationSearchBar />
        </SearchInputContainer>

        {/* Modal */}
        <SearchConfig
          visible={showSearchConfig}
          onCancel={() => setShowSearchConfig(false)}
          onSave={() => {
            setShowSearchConfig(false);
          }}
          isDocumentsApiEnabled={isDocumentsApiEnabled}
        />

        <TabsContainer>
          <ResourceTypeTabsV2
            currentResourceType={currentResourceType || ViewType.All}
            setCurrentResourceType={(tab) => {
              setCurrentResourceType(
                tab === ViewType.All ? undefined : (tab as ResourceType)
              );
            }}
          >
            <Tabs.Tab
              tabKey={ViewType.All}
              label={t('ALL_RESOURCES', 'All resources')}
            />
            <AssetsTab
              tabKey={ViewType.Asset}
              query={debouncedQuery}
              filter={assetFilter}
              label={t('ASSETS', 'Assets')}
            />
            <TimeseriesTab
              tabKey={ViewType.TimeSeries}
              query={debouncedQuery}
              filter={timeseriesFilter}
              label={t('TIMESERIES', 'TIme series')}
            />

            <FilesTab
              tabKey={ViewType.File}
              query={debouncedQuery}
              filter={isDocumentsApiEnabled ? documentFilter : fileFilter}
              isDocumentsApiEnabled={isDocumentsApiEnabled}
              label={t('FILES', 'Files')}
            />
            <EventsTab
              tabKey={ViewType.Event}
              query={debouncedQuery}
              filter={eventFilter}
              label={t('EVENTS', 'Events')}
            />
            <SequenceTab
              tabKey={ViewType.Sequence}
              query={debouncedQuery}
              filter={sequenceFilter}
              label={t('SEQUENCE', 'Sequence')}
            />
            <ThreeDTab
              tabKey={ViewType.ThreeD}
              query={debouncedQuery}
              label={t('3D', '3D')}
            />
          </ResourceTypeTabsV2>
        </TabsContainer>

        <MainContainer $isFilterFeatureEnabled>
          <Wrapper>
            <Routes>
              <Route
                path={routes.root.path}
                element={
                  <AllTab
                    query={query}
                    filters={{ common: commonFilters }}
                    showAllResultsWithEmptyFilters
                    setCurrentResourceType={setCurrentResourceType}
                  />
                }
              />
              <Route
                path={routes.assetView.path}
                element={<AssetSearchResultView />}
              />
              <Route
                path={routes.timeseriesView.path}
                element={<TimeseriesSearchResultView />}
              />
              <Route
                path={routes.fileView.path}
                element={<FileSearchResultView />}
              />
              <Route
                path={routes.eventView.path}
                element={<EventSearchResultView />}
              />
              <Route
                path={routes.sequenceView.path}
                element={<SequenceSearchResultView />}
              />
              <Route
                path={routes.threeDView.path}
                element={<ThreeDSearchResultView />}
              />
            </Routes>
          </Wrapper>
        </MainContainer>
      </MainSearchContainer>
      <DetailsOverlay />
      <BreakJourneyPrompt />
    </RootHeightWrapper>
  );
}

export const SearchResultsPage = () => {
  const [resourceType] = useCurrentResourceType();

  const [query] = useQueryString(SEARCH_KEY);
  const filter = useResourceFilter(resourceType);

  useEffect(() => {
    trackUsage('Exploration.TabChange', { tab: resourceType });
  }, [resourceType]);

  useEffect(() => {
    trackUsage('Exploration.Filter', { tab: resourceType, filter });
  }, [resourceType, filter]);

  useEffect(() => {
    if (query) {
      trackUsage('Exploration.Search', { tab: resourceType, query });
    }
  }, [resourceType, query]);

  return (
    <ThreeDSearchContextProvider>
      <PageTitle title={getPageTitle(query, resourceType)} />
      <SearchPage />
    </ThreeDSearchContextProvider>
  );
};

const SearchInputContainer = styled(Flex)`
  padding: 16px;
  padding-bottom: 12px;
  align-items: center;
`;

const TabsContainer = styled.div`
  flex: 0 0 auto;
`;

const MainContainer = styled(Flex)<{ $isFilterFeatureEnabled?: boolean }>`
  padding-left: ${({ $isFilterFeatureEnabled }) =>
    $isFilterFeatureEnabled ? '0px' : '16px'};
  height: 100%;
  flex: 1;
  overflow: auto;
`;

const SearchFiltersWrapper = styled.div`
  display: flex;
  flex: 0 0 auto;
`;

const Wrapper = styled.div`
  display: flex;
  background: #fff;
  flex: 1 1 auto;
  min-width: 0;
`;

const RootHeightWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: row;
  .cogs-tabs__list__tab {
    margin-right: 0 !important;
  }
`;

const VerticalDivider = styled.div`
  width: 1px;
  height: 16px;
  background-color: var(--cogs-border--muted);
  margin: 0px 8px;
`;

const MainSearchContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  /* width: calc(100% - 303px); */
  flex: 1;
  overflow: auto;
`;
