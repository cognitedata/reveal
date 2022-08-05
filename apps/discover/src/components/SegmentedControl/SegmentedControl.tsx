import React from 'react';

import { SegmentedControl as SegmentedControlOriginal } from '@cognite/cogs.js';

export interface SegmentedControlProps {
  onTabChange: (tabKey: string) => void;
  currentTab: string;
  tabs: Record<string, string>;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  onTabChange,
  currentTab,
  tabs,
}) => {
  return (
    <SegmentedControlOriginal
      currentKey={currentTab}
      onButtonClicked={(tabKey: string) => onTabChange(tabKey)}
    >
      {Object.keys(tabs).map((tab) => (
        <SegmentedControlOriginal.Button key={tab}>
          {tabs[tab]}
        </SegmentedControlOriginal.Button>
      ))}
    </SegmentedControlOriginal>
  );
};
