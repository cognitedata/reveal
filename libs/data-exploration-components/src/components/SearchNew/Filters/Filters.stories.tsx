import React, { useState } from 'react';
import styled from 'styled-components';
import {
  EventFilter,
  AssetFilterProps,
  TimeseriesFilter,
  FileFilterProps,
  SequenceFilter,
} from '@cognite/sdk';
import {
  AssetFiltersV2,
  TimeseriesFilters,
  FileFilters,
  SequenceFilters,
  EventFilters,
} from '.';

export default {
  title: 'Search Results/ResourceFilters',
  component: AssetFiltersV2,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};

export const Asset = () => {
  const [filter, setFilter] = useState<AssetFilterProps>({});
  return <AssetFiltersV2 filter={filter} setFilter={setFilter} />;
};
export const Timeseries = () => {
  const [filter, setFilter] = useState<TimeseriesFilter>({});
  return <TimeseriesFilters filter={filter} setFilter={setFilter} />;
};
export const File = () => {
  const [filter, setFilter] = useState<FileFilterProps>({});
  return <FileFilters filter={filter} setFilter={setFilter} />;
};
export const Sequence = () => {
  const [filter, setFilter] = useState<Required<SequenceFilter>['filter']>({});
  return <SequenceFilters filter={filter} setFilter={setFilter} />;
};
export const Event = () => {
  const [filter, setFilter] = useState<EventFilter>({});
  return <EventFilters filter={filter} setFilter={setFilter} />;
};

const Container = styled.div`
  padding: 20px;
  height: 400px;
  display: flex;
`;
