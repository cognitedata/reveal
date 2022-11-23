import React from 'react';
import { SegmentedControl } from '@cognite/cogs.js';
import { SearchResultToolbar } from '../SearchResultToolbar';

export const TimeseriesToolbar = ({
  onViewChange,
  currentView = 'list',
  showCount = false,
}: {
  onViewChange?: (view: string) => void;
  currentView?: string;
  showCount: boolean;
}) => (
  <>
    <SearchResultToolbar showCount={showCount} type="timeSeries">
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
