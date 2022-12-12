import { SegmentedControl } from '@cognite/cogs.js';
import React from 'react';

export const FileViewSwitcher = ({
  currentView,
  setCurrentView,
}: {
  currentView: string;
  setCurrentView: (view: string) => void;
}) => {
  return (
    <SegmentedControl onButtonClicked={setCurrentView} currentKey={currentView}>
      <SegmentedControl.Button
        key="tree"
        icon="Tree"
        title="Tree"
        aria-label="Tree"
      />
      <SegmentedControl.Button
        key="list"
        icon="List"
        title="List"
        aria-label="List"
      />
    </SegmentedControl>
  );
};
