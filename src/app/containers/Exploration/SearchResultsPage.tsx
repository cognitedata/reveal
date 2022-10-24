import React, { useEffect, useState, useContext } from 'react';
import {
  ResourceItem,
  AssetSearchResults,
  FileSearchResults,
  SequenceSearchResults,
  TimeseriesSearchResults,
  EventSearchResults,
  DocumentSearchResults,
  ResourceTypeTabs,
  getTitle,
  ResourceType,
  SearchFilters as OldSearchFilters,
} from '@cognite/data-exploration';

import { EventSearchResults as NewEventSearchResults } from '../Event/EventSearchResults';

import { Colors, Flex } from '@cognite/cogs.js';
import { trackUsage } from 'app/utils/Metrics';
import ResourceSelectionContext, {
  useResourceFilter,
  useResourceEditable,
} from 'app/context/ResourceSelectionContext';
import { useDebounce } from 'use-debounce';
import styled from 'styled-components/macro';
import ResourcePreview from 'app/containers/Exploration/ResourcePreview';
import {
  useQueryString,
  useQueryStringArray,
  useCurrentResourceType,
  useCurrentResourceId,
} from 'app/hooks/hooks';
import { SEARCH_KEY, CART_KEY } from 'app/utils/constants';
import SelectedResults from 'app/components/SelectionResults/SelectionResults';
import { ExplorationSearchBar } from 'app/containers/Exploration/ExplorationSearchBar';
import { useDateRange } from 'app/context/DateRangeContext';
import { PageTitle } from '@cognite/cdf-utilities';
import { ThreeDSearchResults } from 'app/containers/ThreeD/ThreeDSearchResults';
import FilterToggleButton from './FilterToggleButton';
import { ExplorationFilterToggle } from 'app/containers/Exploration/ExplorationFilterToggle';
import { useFlagFilter, useFlagDocumentSearch } from 'app/hooks/flags';
import { SearchFilters } from 'app/containers/SearchResults/SearchFilters';
import {
  useAssetFilters,
  useEventsFilters,
  useFileFilters,
  useSequenceFilters,
  useTimeseriesFilters,
} from 'app/store/filter/selectors';
import { StyledSplitter } from 'app/containers/elements';
import { useDocumentFilters } from 'app/store/filter/selectors/documentSelectors';
import { useObserveDocumentSearchFilters } from 'app/domain/document/internal/hook/useObserveDocumentSearchFilters';
import { DocumentSort } from 'app/domain/document/internal/types';

const getPageTitle = (query: string, resourceType: ResourceType): string => {
  return `${query}${query ? ' in' : ''} ${getTitle(resourceType, true)}`;
};

function SearchPage() {
  const isFilterFeatureEnabled = useFlagFilter();
  // Adding the flag to manually enable 'Documents' tab to appear.
  const isDocumentEnabled = useFlagDocumentSearch();

  const [currentResourceType, setCurrentResourceType] =
    useCurrentResourceType();

  const [activeId, openPreview] = useCurrentResourceId();
  const [showFilter, setShowFilter] = useState(true);
  const [query] = useQueryString(SEARCH_KEY);
  const [debouncedQuery] = useDebounce(query, 100);

  const editable = useResourceEditable();

  const [rawCart, setCart] = useQueryStringArray(CART_KEY, false);
  const cart = rawCart
    .map(s => parseInt(s, 10))
    .filter(n => Number.isFinite(n));

  const [assetFilter, setAssetFilter] = useAssetFilters();
  const [fileFilter, setFileFilter] = useFileFilters();
  const [documentFilter] = useDocumentFilters();
  const [eventFilter, setEventFilter] = useEventsFilters();
  const [timeseriesFilter, setTimeseriesFilter] = useTimeseriesFilters();
  const [sequenceFilter, setSequenceFilter] = useSequenceFilters();

  const { mode } = useContext(ResourceSelectionContext);
  const [{ column, order }, setDocumentSort] = useState<DocumentSort>({});
  useObserveDocumentSearchFilters({ column, order });

  const onSelect = (item: ResourceItem) => {
    const newCart = cart.includes(item.id)
      ? cart.filter(id => id !== item.id)
      : cart.concat([item.id]);
    setCart(newCart);
  };

  const active = !!activeId || cart.length > 0;

  const isSelected = (item: ResourceItem) => cart.includes(item.id);

  const [dateRange, setDateRange] = useDateRange();

  const commonProps = {
    query: debouncedQuery,
    onSelect,
    selectionMode: mode,
    isSelected,
    activeIds: activeId ? [activeId] : [],
    disableScroll: !!activeId,
    dateRange,
    onDateRangeChange: setDateRange,
  };

  const handleFilterToggleClick = React.useCallback(() => {
    setShowFilter(prevState => !prevState);
  }, []);

  if (isFilterFeatureEnabled) {
    return (
      <RootHeightWrapperNew>
        <SearchFiltersWrapper>
          <SearchFilters
            resourceType={currentResourceType}
            visible={currentResourceType !== 'threeD' && showFilter}
          />
        </SearchFiltersWrapper>

        <MainSearchContainer>
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

            <ExplorationSearchBar />
          </SearchInputContainer>

          <TabsContainer>
            <ResourceTypeTabs
              showCount
              query={query}
              currentResourceType={currentResourceType}
              setCurrentResourceType={setCurrentResourceType}
              isDocumentEnabled={isDocumentEnabled}
            />
          </TabsContainer>

          <MainContainer $isFilterFeatureEnabled={isFilterFeatureEnabled}>
            <Wrapper>
              <StyledSplitter secondaryMinSize={415} primaryIndex={1}>
                <Flex
                  direction="column"
                  style={{
                    borderRight: active
                      ? `1px solid ${Colors['greyscale-grey3'].hex()}`
                      : 'unset',
                  }}
                >
                  <SearchResultWrapper>
                    {currentResourceType === 'asset' && (
                      <AssetSearchResults
                        showCount
                        onClick={(item: ResourceItem) =>
                          openPreview(
                            item.id !== activeId ? item.id : undefined
                          )
                        }
                        filter={assetFilter}
                        {...commonProps}
                      />
                    )}
                    {currentResourceType === 'file' && (
                      <FileSearchResults
                        showCount
                        filter={fileFilter}
                        allowEdit={editable}
                        onClick={(item: ResourceItem) =>
                          openPreview(
                            item.id !== activeId ? item.id : undefined
                          )
                        }
                        {...commonProps}
                      />
                    )}
                    {currentResourceType === 'document' && (
                      <DocumentSearchResults
                        query={query}
                        filter={documentFilter}
                        onClick={(item: ResourceItem) => {
                          openPreview(
                            item.id !== activeId ? item.id : undefined
                          );
                        }}
                        onSortClicked={(column, desc) => {
                          if (desc !== undefined) {
                            const order = desc ? 'desc' : 'asc';
                            setDocumentSort({ column, order });
                          }
                        }}
                      />
                    )}
                    {currentResourceType === 'sequence' && (
                      <SequenceSearchResults
                        showCount
                        onClick={(item: ResourceItem) =>
                          openPreview(
                            item.id !== activeId ? item.id : undefined
                          )
                        }
                        filter={sequenceFilter}
                        {...commonProps}
                      />
                    )}
                    {currentResourceType === 'timeSeries' && (
                      <TimeseriesSearchResults
                        showCount
                        onClick={(item: ResourceItem) =>
                          openPreview(
                            item.id !== activeId ? item.id : undefined
                          )
                        }
                        filter={timeseriesFilter}
                        showDatePicker={!activeId}
                        {...commonProps}
                      />
                    )}
                    {currentResourceType === 'event' && (
                      <NewEventSearchResults
                        showCount
                        onClick={(item: any) =>
                          openPreview(
                            item.id !== activeId ? item.id : undefined
                          )
                        }
                        filter={eventFilter}
                        {...commonProps}
                      />
                    )}
                    {currentResourceType === 'threeD' && (
                      <ThreeDSearchResults
                        onClick={(item: ResourceItem) => {
                          openPreview(
                            item.id !== activeId ? item.id : undefined
                          );
                        }}
                        query={query}
                      />
                    )}
                  </SearchResultWrapper>
                </Flex>

                {active && activeId && (
                  <SearchResultWrapper>
                    <ResourcePreview
                      item={{ id: activeId, type: currentResourceType }}
                    />
                  </SearchResultWrapper>
                )}
                {!activeId && cart.length > 0 && (
                  <SelectedResults
                    ids={cart.map(id => ({ id }))}
                    resourceType={currentResourceType}
                  />
                )}
              </StyledSplitter>
            </Wrapper>
          </MainContainer>
        </MainSearchContainer>
      </RootHeightWrapperNew>
    );
  }

  return (
    <RootHeightWrapper>
      <SearchInputContainer alignItems="center">
        {isFilterFeatureEnabled && (
          <>
            <ExplorationFilterToggle
              filterState={showFilter}
              onClick={handleFilterToggleClick}
            />
            <VerticalDivider />
          </>
        )}
        <ExplorationSearchBar />
      </SearchInputContainer>
      <TabsContainer>
        <ResourceTypeTabs
          showCount
          query={query}
          currentResourceType={currentResourceType}
          setCurrentResourceType={setCurrentResourceType}
          isDocumentEnabled={isDocumentEnabled}
        />
      </TabsContainer>
      <MainContainer $isFilterFeatureEnabled={isFilterFeatureEnabled}>
        {currentResourceType !== 'threeD' && !showFilter && (
          <FilterWrapper>
            <FilterToggleButton toggleOpen={handleFilterToggleClick} />
          </FilterWrapper>
        )}

        <SearchFiltersWrapper>
          {isFilterFeatureEnabled ? (
            <SearchFilters
              resourceType={currentResourceType}
              visible={currentResourceType !== 'threeD' && showFilter}
            />
          ) : (
            <OldSearchFilters
              assetFilter={assetFilter}
              setAssetFilter={setAssetFilter}
              timeseriesFilter={timeseriesFilter}
              setTimeseriesFilter={setTimeseriesFilter}
              sequenceFilter={sequenceFilter}
              setSequenceFilter={setSequenceFilter}
              eventFilter={eventFilter}
              setEventFilter={setEventFilter}
              fileFilter={fileFilter}
              setFileFilter={setFileFilter}
              resourceType={currentResourceType}
              closeFilters={() => setShowFilter(false)}
              visible={currentResourceType !== 'threeD' && showFilter}
            />
          )}
        </SearchFiltersWrapper>

        <Wrapper>
          <StyledSplitter secondaryMinSize={415} primaryIndex={1}>
            <Flex
              direction="column"
              style={{
                borderRight: active
                  ? `1px solid ${Colors['greyscale-grey3'].hex()}`
                  : 'unset',
              }}
            >
              <SearchResultWrapper>
                {currentResourceType === 'asset' && (
                  <AssetSearchResults
                    showCount
                    onClick={(item: ResourceItem) =>
                      openPreview(item.id !== activeId ? item.id : undefined)
                    }
                    filter={assetFilter}
                    {...commonProps}
                  />
                )}
                {currentResourceType === 'file' && (
                  <FileSearchResults
                    showCount
                    filter={fileFilter}
                    allowEdit={editable}
                    onClick={(item: ResourceItem) =>
                      openPreview(item.id !== activeId ? item.id : undefined)
                    }
                    {...commonProps}
                  />
                )}
                {currentResourceType === 'document' && (
                  <DocumentSearchResults
                    query={query}
                    filter={fileFilter}
                    onClick={(item: ResourceItem) => {
                      openPreview(item.id !== activeId ? item.id : undefined);
                    }}
                    onSortClicked={(column, desc) => {
                      if (desc !== undefined) {
                        const order = desc ? 'desc' : 'asc';
                        setDocumentSort({ column, order });
                      }
                    }}
                  />
                )}
                {currentResourceType === 'sequence' && (
                  <SequenceSearchResults
                    showCount
                    onClick={(item: ResourceItem) =>
                      openPreview(item.id !== activeId ? item.id : undefined)
                    }
                    filter={sequenceFilter}
                    {...commonProps}
                  />
                )}
                {currentResourceType === 'timeSeries' && (
                  <TimeseriesSearchResults
                    showCount
                    onClick={(item: ResourceItem) =>
                      openPreview(item.id !== activeId ? item.id : undefined)
                    }
                    filter={timeseriesFilter}
                    showDatePicker={!activeId}
                    {...commonProps}
                  />
                )}
                {currentResourceType === 'event' && (
                  <EventSearchResults
                    showCount
                    onClick={(item: ResourceItem) =>
                      openPreview(item.id !== activeId ? item.id : undefined)
                    }
                    filter={eventFilter}
                    {...commonProps}
                  />
                )}
                {currentResourceType === 'threeD' && (
                  <ThreeDSearchResults
                    onClick={(item: ResourceItem) => {
                      openPreview(item.id !== activeId ? item.id : undefined);
                    }}
                    query={query}
                  />
                )}
              </SearchResultWrapper>
            </Flex>

            {active && activeId && (
              <SearchResultWrapper>
                <ResourcePreview
                  item={{ id: activeId, type: currentResourceType }}
                />
              </SearchResultWrapper>
            )}
            {!activeId && cart.length > 0 && (
              <SelectedResults
                ids={cart.map(id => ({ id }))}
                resourceType={currentResourceType}
              />
            )}
          </StyledSplitter>
        </Wrapper>
      </MainContainer>
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
    <>
      <PageTitle title={getPageTitle(query, resourceType)} />
      <SearchPage />
    </>
  );
};

const SearchResultWrapper = styled.div`
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

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
  height: calc(100% - 140px);
  flex: 1;
`;

const FilterWrapper = styled.div`
  padding-top: 1rem;
  border-right: 1px solid ${Colors['greyscale-grey3'].hex()};
  padding-right: 10px;
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
  flex-direction: column;
`;

const RootHeightWrapperNew = styled.div`
  height: 100%;
  display: flex;
  flex-direction: row;
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
