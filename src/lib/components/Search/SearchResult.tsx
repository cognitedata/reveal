import React from 'react';
import styled from 'styled-components';
import { ResourceType } from 'lib/types';
import { SequenceSearchResults } from 'lib/containers/Sequences';
import { AssetSearchResults } from 'lib/containers/Assets';
import { FileSearchResults } from 'lib/containers/Files';
import { TimeseriesSearchResults } from 'lib/containers/Timeseries';
import { EventSearchResults } from 'lib/containers/Events';
import { SelectableItemsProps } from '../../CommonProps';

export function SearchResult({
  type,
  query,
  ...commonProps
}: {
  type: ResourceType;
  query: string;
  activeIds?: number[];
} & SelectableItemsProps) {
  switch (type) {
    case 'asset':
      return <AssetSearchResults query={query} {...commonProps} />;
    case 'file':
      return <FileSearchResults query={query} {...commonProps} />;
    case 'sequence':
      return <SequenceSearchResults query={query} {...commonProps} />;
    case 'timeSeries':
      return <TimeseriesSearchResults query={query} {...commonProps} />;
    case 'event':
      return <EventSearchResults query={query} {...commonProps} />;
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
