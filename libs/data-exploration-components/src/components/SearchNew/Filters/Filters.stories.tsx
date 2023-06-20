import React, { useState } from 'react';

import styled from 'styled-components';

import { OldFileFilters } from '@data-exploration/containers';
import noop from 'lodash/noop';

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
  return <AssetFiltersV2 filter={filter as any} setFilter={setFilter as any} />;
};
export const Timeseries = () => {
  const [filter, setFilter] = useState<TimeseriesFilter>({});
  return (
    <TimeseriesFilters filter={filter as any} setFilter={setFilter as any} />
  );
};
export const File = () => {
  const [filter, setFilter] = useState<FileFilterProps>({});
  return (
    <OldFileFilters
      filter={filter as any}
      setFilter={setFilter as any}
      onResetFilterClick={noop}
    />
  );
};
export const Sequence = () => {
  const [filter, setFilter] = useState<Required<SequenceFilter>['filter']>({});
  return (
    <SequenceFilters filter={filter as any} setFilter={setFilter as any} />
  );
};
export const Event = () => {
  const [filter, setFilter] = useState<EventFilter>({});
  return <EventFilters filter={filter as any} setFilter={setFilter as any} />;
};

const Container = styled.div`
  padding: 20px;
  height: 400px;
  display: flex;
`;
