import React from 'react';
import styled from 'styled-components';
import { ResourceType } from 'lib/types';
import { SequenceSearchResults } from 'lib/containers/Sequences';
import { AssetSearchResults } from 'lib/containers/Assets';
import { FileSearchResults } from 'lib/containers/Files';
import { TimeseriesSearchResults } from 'lib/containers/Timeseries';
import { EventSearchResults } from 'lib/containers/Events';

export function SearchResult({
  type,
  query,
}: {
  type: ResourceType;
  query: string;
}) {
  switch (type) {
    case 'asset':
      return <AssetSearchResults query={query} />;
    case 'file':
      return <FileSearchResults query={query} />;
    case 'sequence':
      return <SequenceSearchResults query={query} />;
    case 'timeSeries':
      return <TimeseriesSearchResults query={query} />;
    case 'event':
      return <EventSearchResults query={query} />;
    default:
      return null;
  }
}

export const Wrapper = styled.div`
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  overflow: auto;
  overflow: hidden;
  height: 100%;
`;
