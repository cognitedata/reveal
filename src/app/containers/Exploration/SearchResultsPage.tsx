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
import { SEARCH_KEY, CART_KEY } from 'app/utils/constants';
import SelectedResults from 'app/components/SelectionResults/SelectionResults';
import { ExplorationSearchBar } from 'app/containers/Exploration/ExplorationSearchBar';
import { useDateRange } from 'app/context/DateRangeContext';
import { PageTitle } from '@cognite/cdf-utilities';
import FilterToggleButton from './FilterToggleButton';
import { LabelsQuickSelect } from './LabelsQuickSelect';

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
  const [
    currentResourceType,
    setCurrentResourceType,
  ] = useCurrentResourceType();

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
          visible={showFilter}
        />
        <div
          style={{
            width: active ? 440 : 'unset',
            flex: active ? 'unset' : 1,
            borderRight: active
              ? `1px solid ${Colors['greyscale-grey3'].hex()}`
              : 'unset',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <SearchInputContainer align="middle">
            {!showFilter ? (
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
          {['file', 'asset'].includes(currentResourceType) ? (
            <Row style={{ marginTop: 8, marginLeft: showFilter ? 8 : 0 }}>
              <Col flex="auto">
                <LabelsQuickSelect
                  key={currentResourceType}
                  type={currentResourceType as 'file' | 'asset'}
                />
              </Col>
            </Row>
          ) : undefined}
          <SearchResultWrapper
            style={{
              paddingRight: active ? 8 : 0,
              paddingLeft: showFilter ? 8 : 0,
            }}
          >
            {SearchResults()}
          </SearchResultWrapper>
        </div>

        <div
          style={{
            width: active ? 'unset' : 0,
            flex: active ? 1 : 'unset',
          }}
        >
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
      </Wrapper>
    </>
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
  overflow: auto;
  height: 100%;
`;

const SearchInputContainer = styled(Row)`
  border-bottom: 1px solid ${Colors['greyscale-grey3'].hex()};
  padding-top: 20px;
  padding-bottom: 16px;
`;
