import React, { useEffect, useRef, useState, useContext } from 'react';
import {
  ResourceItem,
  ResourcePreviewProvider,
  SearchFilters,
  ResourceTypeTabs,
  SearchResults,
} from 'lib';
import { Row, Col } from 'antd';
import { trackUsage, Timer, trackTimedUsage } from 'app/utils/Metrics';
import ResourceSelectionContext, {
  useResourceFilter,
  useSelectedResource,
  useResourceEditable,
} from 'app/context/ResourceSelectionContext';
import { useDebounce } from 'use-debounce/lib';
import styled from 'styled-components';
import ResourcePreview from 'app/containers/Exploration/ResourcePreview';
import { lightGrey } from 'lib/utils/Colors';
import {
  useQueryString,
  useQueryStringArray,
  useCurrentResourceType,
  useCurrentResourceId,
} from 'app/hooks';
import { SEARCH_KEY, CART_KEY } from 'app/utils/contants';
import SelectedResults from 'app/components/SelectionResults/SelectionResults';
import { ExplorationSearchBar } from 'app/containers/Exploration/ExplorationSearchBar';
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

  return (
    <ResourcePreviewProvider>
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
            borderRight: active ? `1px solid ${lightGrey}` : 'unset',
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
          <Row style={{ marginTop: 8, marginLeft: showFilter ? 8 : 0 }}>
            <Col flex="auto">
              <LabelsQuickSelect />
            </Col>
          </Row>

          <SearchResultWrapper
            style={{
              paddingRight: active ? 8 : 0,
              paddingLeft: showFilter ? 8 : 0,
            }}
          >
            <SearchResults
              query={debouncedQuery}
              assetFilter={assetFilter}
              timeseriesFilter={timeseriesFilter}
              sequenceFilter={sequenceFilter}
              eventFilter={eventFilter}
              fileFilter={fileFilter}
              resourceType={currentResourceType}
              allowEdit={editable}
              onClick={item => openPreview(item.id)}
              onSelect={onSelect}
              selectionMode={mode}
              isSelected={isSelected}
              activeIds={activeId ? [activeId] : []}
            />
          </SearchResultWrapper>
        </div>

        <div
          style={{
            width: active ? 'unset' : 0,
            flex: active ? 1 : 'unset',
          }}
        >
          {cart.length > 0 && (
            <SelectedResults
              ids={cart.map(id => ({ id }))}
              resourceType={currentResourceType}
            />
          )}
          {activeId && cart.length === 0 && (
            <SearchResultWrapper>
              <ResourcePreview
                item={{ id: activeId, type: currentResourceType }}
                onCloseClicked={() => openPreview(undefined)}
              />
            </SearchResultWrapper>
          )}
        </div>
      </Wrapper>
    </ResourcePreviewProvider>
  );
}

export const SearchResultsPage = () => {
  const [resourceType] = useCurrentResourceType();

  const [query] = useQueryString(SEARCH_KEY);
  const filter = useResourceFilter(resourceType);
  const { selectedResource } = useSelectedResource();

  useEffect(() => {
    trackUsage('Exploration.ResourceType', { resourceType });
  }, [resourceType]);

  useEffect(() => {
    trackUsage('Exploration.Filter', { resourceType, filter });
  }, [resourceType, filter]);

  useEffect(() => {
    if (query) {
      trackUsage('Exploration.Query', { query });
    }
  }, [query]);

  const timer = useRef<Timer>();

  useEffect(() => {
    if (selectedResource) {
      trackUsage('Exploration.PreviewResource', selectedResource);
      if (timer.current) {
        timer.current.stop({
          type: selectedResource.type,
          id: selectedResource.id,
        });
      }
    } else {
      timer.current = trackTimedUsage('Exploration.SearchTime');
    }

    return () => timer.current?.stop();
  }, [selectedResource]);

  return <SearchPage />;
};

const SearchResultWrapper = styled.div`
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  overflow: auto;
  height: 100%;
`;

const SearchInputContainer = styled(Row)`
  border-bottom: 1px solid ${lightGrey};
  padding-top: 20px;
  padding-bottom: 16px;
`;
