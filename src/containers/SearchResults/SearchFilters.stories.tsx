import { ComponentStory } from '@storybook/react';
import React, { useState } from 'react';
import {
  EventFilter,
  AssetFilterProps,
  TimeseriesFilter,
  FileFilterProps,
  SequenceFilter,
} from '@cognite/sdk';
import styled from 'styled-components';
import { Wrapper } from '../../docs/utils';
import { SearchFilters } from './SearchFilters';

export default {
  title: 'Search Results/Search Filters',
  component: SearchFilters,
  decorators: [(storyFn: any) => <Wrapper>{storyFn()}</Wrapper>],
  args: {
    allowHide: false,
  },
};

export const Asset: ComponentStory<typeof SearchFilters> = args => {
  const [assetFilter, setAssetFilter] = useState<AssetFilterProps>({});
  return (
    <Container>
      <SearchFilters
        {...args}
        assetFilter={assetFilter}
        setAssetFilter={setAssetFilter}
        resourceType="asset"
      />
    </Container>
  );
};

export const Timeseries: ComponentStory<typeof SearchFilters> = args => {
  const [timeseriesFilter, setTimeseriesFilter] = useState<TimeseriesFilter>(
    {}
  );
  return (
    <Container>
      <SearchFilters
        {...args}
        timeseriesFilter={timeseriesFilter}
        setTimeseriesFilter={setTimeseriesFilter}
        resourceType="timeSeries"
      />
    </Container>
  );
};

export const File: ComponentStory<typeof SearchFilters> = args => {
  const [fileFilter, setFileFilter] = useState<FileFilterProps>({});
  return (
    <Container>
      <SearchFilters
        {...args}
        fileFilter={fileFilter}
        setFileFilter={setFileFilter}
        resourceType="file"
      />
    </Container>
  );
};

export const Event: ComponentStory<typeof SearchFilters> = args => {
  const [eventFilter, setEventFilter] = useState<EventFilter>({});
  return (
    <Container>
      <SearchFilters
        {...args}
        eventFilter={eventFilter}
        setEventFilter={setEventFilter}
        resourceType="event"
      />
    </Container>
  );
};

export const Sequence: ComponentStory<typeof SearchFilters> = args => {
  const [sequenceFilter, setSequenceFilter] = useState<
    Required<SequenceFilter>['filter']
  >({});
  return (
    <Container>
      <SearchFilters
        {...args}
        sequenceFilter={sequenceFilter}
        setSequenceFilter={setSequenceFilter}
        resourceType="sequence"
      />
    </Container>
  );
};

const Container = styled.div`
  height: 100%;
`;
