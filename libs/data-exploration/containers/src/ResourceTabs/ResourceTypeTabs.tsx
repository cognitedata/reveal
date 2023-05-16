import React, { JSXElementConstructor } from 'react';
import { TabProps, Tabs } from '@cognite/cogs.js';

export interface Props {
  currentResourceType?: string;
  setCurrentResourceType: (tab?: string) => void;
  children: React.ReactElement<TabProps, string | JSXElementConstructor<any>>[];
}

export const ResourceTypeTabs = ({
  currentResourceType = 'all',
  setCurrentResourceType,
  ...rest
}: Props) => {
  return (
    <Tabs
      activeKey={currentResourceType}
      onTabClick={(tab) => {
        setCurrentResourceType(tab);
      }}
      showTrack
      {...rest}
    />
  );
};
