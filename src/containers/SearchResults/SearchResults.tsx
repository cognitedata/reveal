import React, { useMemo } from 'react';
import { ResourceType } from 'types';
import styled from 'styled-components';
import { useDebounce } from 'use-debounce/lib';
import { useQuery, useResourceTypes } from 'context/ResourceSelectionContext';
import { ResourcePreviewProvider } from 'context';
import { SequenceSearchResults } from 'containers/Sequences';
import { AssetSearchResults } from 'containers/Assets';
import { FileSearchResults, FileToolbar } from 'containers/Files';
import { TimeseriesSearchResults } from 'containers/Timeseries';
import { EventSearchResults } from 'containers/Events';
import { SearchResultFilters } from './SearchResultFilters';
import { ResourceTypeTabs } from './Filters';

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  padding: 16px;
  background: #fff;
  overflow: hidden;
`;

export const SearchResults = ({
  currentResourceType,
  setCurrentResourceType,
}: {
  currentResourceType: ResourceType;
  setCurrentResourceType: (newResourceType: ResourceType) => void;
}) => {
  const resourceTypes = useResourceTypes();
  const [query] = useQuery();
  const [debouncedQuery] = useDebounce(query, 100);

  const content = useMemo(() => {
    switch (currentResourceType) {
      case 'asset':
        return <AssetSearchResults query={debouncedQuery} />;
      case 'file':
        return <FileSearchResults query={debouncedQuery} />;
      case 'sequence':
        return <SequenceSearchResults query={debouncedQuery} />;
      case 'timeSeries':
        return <TimeseriesSearchResults query={debouncedQuery} />;
      case 'event':
        return <EventSearchResults query={debouncedQuery} />;
      default:
        return null;
    }
  }, [currentResourceType, debouncedQuery]);

  const toolbar = useMemo(() => {
    switch (currentResourceType) {
      case 'file':
        return <FileToolbar />;
      default:
        return null;
    }
  }, [currentResourceType]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {resourceTypes.length > 1 && (
        <ResourceTypeTabs
          currentResourceType={currentResourceType}
          setCurrentResourceType={setCurrentResourceType}
        />
      )}
      <div style={{ flex: 1 }}>
        <ResourcePreviewProvider>
          <Wrapper>
            <Filters>
              <SearchResultFilters currentResourceType={currentResourceType} />
            </Filters>
            <Content>
              {toolbar}
              {content}
            </Content>
          </Wrapper>
        </ResourcePreviewProvider>
      </div>
    </div>
  );
};

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
  overflow: hidden;
`;

export const Filters = styled.div`
  display: flex;
  flex-direction: column;
  width: 260px;
  margin-right: 16px;
`;
