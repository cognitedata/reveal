import React, { useMemo } from 'react';
import { ResourceType } from 'lib/types';
import styled from 'styled-components';
import { useDebounce } from 'use-debounce/lib';
import {
  useQuery,
  useResourceTypes,
} from 'lib/context/ResourceSelectionContext';
import { ResourcePreviewProvider } from 'lib/context';
import { SequenceSearchResults } from 'lib/containers/Sequences';
import { AssetSearchResults } from 'lib/containers/Assets';
import { FileSearchResults } from 'lib/containers/Files';
import { TimeseriesSearchResults } from 'lib/containers/Timeseries';
import { EventSearchResults } from 'lib/containers/Events';
import { SearchResultFilters } from './SearchResultFilters';
import { ResourceTypeTabs } from './ResourceTypeTabs';

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

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {resourceTypes.length > 1 && (
        <ResourceTypeTabs
          currentResourceType={currentResourceType}
          setCurrentResourceType={setCurrentResourceType}
        />
      )}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <ResourcePreviewProvider>
          <Wrapper>
            <Filters>
              <SearchResultFilters currentResourceType={currentResourceType} />
            </Filters>
            <Content>{content}</Content>
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
  overflow-x: visible;
  overflow-y: auto;
`;
