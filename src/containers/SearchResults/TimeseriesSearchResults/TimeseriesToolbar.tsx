import React from 'react';
import { SegmentedControl } from '@cognite/cogs.js';
import { SearchResultToolbar } from '../SearchResultToolbar';

export const TimeseriesToolbar = ({
  onViewChange,
  currentView = 'list',
  query,
  showCount = false,
  filter,
  count,
}: {
  onViewChange?: (view: string) => void;
  currentView?: string;
  query: string;
  showCount: boolean;
  count?: number;
  filter?: any;
}) => (
  <>
    <SearchResultToolbar
      showCount={showCount}
      api={query?.length > 0 ? 'search' : 'list'}
      type="timeSeries"
      filter={filter}
      count={count}
      query={query}
    >
      <SegmentedControl onButtonClicked={onViewChange} currentKey={currentView}>
        <SegmentedControl.Button
          key="list"
          icon="List"
          title="List"
          aria-label="List"
        />
        <SegmentedControl.Button
          key="grid"
          icon="Grid"
          title="Grid"
          aria-label="Grid"
        />
      </SegmentedControl>
    </SearchResultToolbar>
  </>
);
