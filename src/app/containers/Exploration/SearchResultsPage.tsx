import React, { useEffect, useState, useContext } from 'react';
import {
  ResourceItem,
  SearchFilters,
  AssetSearchResults,
  FileSearchResults,
  SequenceSearchResults,
  TimeseriesSearchResults,
  EventSearchResults,
  ResourceTypeTabs,
  getTitle,
  ResourceType,
  Splitter,
} from '@cognite/data-exploration';
import { Colors } from '@cognite/cogs.js';
import { Row, Col } from 'antd';
import { trackUsage } from 'app/utils/Metrics';
import ResourceSelectionContext, {
  useResourceFilter,
  useResourceEditable,
} from 'app/context/ResourceSelectionContext';
import { useDebounce } from 'use-debounce/lib';
import styled from 'styled-components';
import ResourcePreview from 'app/containers/Exploration/ResourcePreview';
import {
  useQueryString,
  useQueryStringArray,
  useCurrentResourceType,
  useCurrentResourceId,
} from 'app/hooks';
import { SEARCH_KEY, CART_KEY, FILTER } from 'app/utils/constants';
import SelectedResults from 'app/components/SelectionResults/SelectionResults';
import { ExplorationSearchBar } from 'app/containers/Exploration/ExplorationSearchBar';
import { useDateRange } from 'app/context/DateRangeContext';
import { PageTitle } from '@cognite/cdf-utilities';
import { ThreeDSearchResults } from 'app/containers/ThreeD/ThreeDSearchResults';
import FilterToggleButton from './FilterToggleButton';

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: calc(100% - 56px);
  background: #fff;
  overflow: hidden;
`;

const getPageTitle = (query: string, resourceType: ResourceType): string => {
  return `${query}${query ? ' in' : ''} ${getTitle(resourceType, true)}`;
};

function SearchPage() {
  const [currentResourceType, setCurrentResourceType] =
    useCurrentResourceType();

  const [activeId, openPreview] = useCurrentResourceId();
  const [showFilter, setShowFilter] = useState(false);
  const [query] = useQueryString(SEARCH_KEY);
  const [debouncedQuery] = useDebounce(query, 100);

  const editable = useResourceEditable();

  const [rawCart, setCart] = useQueryStringArray(CART_KEY, false);
  const cart = rawCart
    .map(s => parseInt(s, 10))
    .filter(n => Number.isFinite(n));

  const {
    assetFilter,
    setAssetFilter,
    timeseriesFilter,
    setTimeseriesFilter,
    sequenceFilter,
    setSequenceFilter,
    eventFilter,
    setEventFilter,
    fileFilter,
    setFileFilter,
    mode,
  } = useContext(ResourceSelectionContext);

  const [filterQuery, setFilterQuery] = useQueryString(FILTER);

  // Stringify the JSON file in order to ad in search query
  const assetsFilterStringify = JSON.stringify(assetFilter);
  const eventsFilterStringify = JSON.stringify(eventFilter);
  const timeseriesFilterStringify = JSON.stringify(timeseriesFilter);
  const fileFilterStringify = JSON.stringify(fileFilter);
  const sequenceFilterStringify = JSON.stringify(sequenceFilter);

  // Checking the length of filter to avoid the unneccesarry use of useEffect
  const isEventFilterApplied = Object.keys(eventFilter).length > 0;
  const isAssetFilterApplied = Object.keys(assetFilter).length > 0;
  const isTimeseriesFilterApplied = Object.keys(timeseriesFilter).length > 0;
  const isFileFilterApplied = Object.keys(fileFilter).length > 0;
  const isSequenceFilterApplied = Object.keys(sequenceFilter).length > 0;

  useEffect(() => {
    if (currentResourceType === 'asset' && isAssetFilterApplied) {
      setFilterQuery(assetsFilterStringify);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAssetFilterApplied, assetsFilterStringify, currentResourceType]);

  useEffect(() => {
    if (currentResourceType === 'event' && isEventFilterApplied) {
      setFilterQuery(eventsFilterStringify);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEventFilterApplied, eventsFilterStringify, currentResourceType]);

  useEffect(() => {
    if (currentResourceType === 'timeSeries' && isTimeseriesFilterApplied) {
      setFilterQuery(timeseriesFilterStringify);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isTimeseriesFilterApplied,
    timeseriesFilterStringify,
    currentResourceType,
  ]);

  useEffect(() => {
    if (currentResourceType === 'file' && isFileFilterApplied) {
      setFilterQuery(fileFilterStringify);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isFileFilterApplied,
    fileFilterStringify,
    currentResourceType,
    fileFilter,
  ]);

  useEffect(() => {
    if (currentResourceType === 'sequence' && isSequenceFilterApplied) {
      setFilterQuery(sequenceFilterStringify);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSequenceFilterApplied, sequenceFilterStringify, currentResourceType]);

  // Applying the filter from the url on component mount
  useEffect(() => {
    const filters = filterQuery.length > 0 && JSON.parse(filterQuery);
    const isUrlFilterAvailable = filters || Object.keys(filters).length > 0;
    if (isUrlFilterAvailable) {
      switch (currentResourceType) {
        case 'asset':
          setAssetFilter(filters);
          break;
        case 'event':
          setEventFilter(filters);
          break;
        case 'file':
          setFileFilter(filters);
          break;
        case 'sequence':
          setSequenceFilter(filters);
          break;
        case 'timeSeries':
          setTimeseriesFilter(filters);
          break;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSelect = (item: ResourceItem) => {
    const newCart = cart.includes(item.id)
      ? cart.filter(id => id !== item.id)
      : cart.concat([item.id]);
    setCart(newCart);
  };

  const active = !!activeId || cart.length > 0;

  const isSelected = (item: ResourceItem) => cart.includes(item.id);

  const [dateRange, setDateRange] = useDateRange();

  const SearchResults = () => {
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
    switch (currentResourceType) {
      case 'asset':
        return (
          <AssetSearchResults
            onClick={(item: ResourceItem) =>
              openPreview(item.id !== activeId ? item.id : undefined)
            }
            filter={assetFilter}
            {...commonProps}
          />
        );
      case 'file':
        return (
          <FileSearchResults
            filter={fileFilter}
            allowEdit={editable}
            onClick={(item: ResourceItem) =>
              openPreview(item.id !== activeId ? item.id : undefined)
            }
            {...commonProps}
          />
        );
      case 'sequence':
        return (
          <SequenceSearchResults
            onClick={(item: ResourceItem) =>
              openPreview(item.id !== activeId ? item.id : undefined)
            }
            filter={sequenceFilter}
            {...commonProps}
          />
        );
      case 'timeSeries':
        return (
          <TimeseriesSearchResults
            onClick={(item: ResourceItem) =>
              openPreview(item.id !== activeId ? item.id : undefined)
            }
            filter={timeseriesFilter}
            showDatePicker={!activeId}
            {...commonProps}
          />
        );
      case 'event':
        return (
          <EventSearchResults
            onClick={(item: ResourceItem) =>
              openPreview(item.id !== activeId ? item.id : undefined)
            }
            filter={eventFilter}
            {...commonProps}
          />
        );
      case 'threeD':
        return <ThreeDSearchResults query={query} />;
      default:
        return null;
    }
  };

  return (
    <>
      <ResourceTypeTabs
        currentResourceType={currentResourceType}
        setCurrentResourceType={setCurrentResourceType}
      />

      <Wrapper>
        <SearchFilters
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
        <StyledSplitter secondaryMinSize={440} primaryIndex={1}>
          <div
            style={{
              borderRight: active
                ? `1px solid ${Colors['greyscale-grey3'].hex()}`
                : 'unset',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <SearchInputContainer align="middle">
              {currentResourceType !== 'threeD' && !showFilter ? (
                <Col flex="none">
                  <FilterToggleButton
                    toggleOpen={() => setShowFilter(!showFilter)}
                  />
                </Col>
              ) : undefined}
              <Col flex="auto">
                <ExplorationSearchBar />
              </Col>
            </SearchInputContainer>
            <SearchResultWrapper
              style={{
                paddingRight: active ? 8 : 0,
                paddingLeft: showFilter ? 8 : 0,
              }}
            >
              {SearchResults()}
            </SearchResultWrapper>
          </div>

          {active && (
            <div>
              {activeId && (
                <SearchResultWrapper>
                  <ResourcePreview
                    item={{ id: activeId, type: currentResourceType }}
                    onCloseClicked={() => openPreview(undefined)}
                  />
                </SearchResultWrapper>
              )}
              {!activeId && cart.length > 0 && (
                <SelectedResults
                  ids={cart.map(id => ({ id }))}
                  resourceType={currentResourceType}
                />
              )}
            </div>
          )}
        </StyledSplitter>
      </Wrapper>
    </>
  );
}
const StyledSplitter = styled(Splitter)`
  .splitter-layout .layout-pane.layout-pane-primary {
    overflow: hidden;
  }
`;

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

const SearchInputContainer = styled(Row)`
  border-bottom: 1px solid ${Colors['greyscale-grey3'].hex()};
  padding-top: 20px;
  padding-bottom: 16px;
`;
