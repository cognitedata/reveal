import React, { useMemo } from 'react';
import { ResourceType } from 'types';
import styled from 'styled-components';
import { useDebounce } from 'use-debounce/lib';
import { useQuery, useResourceTypes } from 'context/ResourceSelectionContext';
import { ResourcePreviewProvider } from 'context';
import { ResourceFilters } from 'containers/SearchResults/Filters';
import { SequenceSearchResults } from 'containers/Sequences';
import { AssetSearchResults } from 'containers/Assets';
import { FileSearchResults, FileToolbar } from 'containers/Files';
import { TimeseriesSearchResults } from 'containers/Timeseries';
import { EventSearchResults } from 'containers/Events';
import { FormItem, SearchResultFilters } from './SearchResultFilters';

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
    <ResourcePreviewProvider>
      <Wrapper>
        <Filters>
          {resourceTypes.length > 0 && (
            <FormItem>
              <ResourceFilters
                currentResourceType={currentResourceType}
                setCurrentResourceType={setCurrentResourceType}
              />
            </FormItem>
          )}
          <SearchResultFilters currentResourceType={currentResourceType} />
        </Filters>
        <Content>
          {toolbar}
          {content}
        </Content>
      </Wrapper>
    </ResourcePreviewProvider>
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
