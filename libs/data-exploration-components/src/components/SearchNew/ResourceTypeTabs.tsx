import React, { JSXElementConstructor } from 'react';
import { Colors, TabProps, Tabs } from '@cognite/cogs.js';
import styled from 'styled-components/macro';

export interface Props {
  currentResourceType?: string;
  setCurrentResourceType: (tab?: string) => void;
  children: React.ReactElement<TabProps, string | JSXElementConstructor<any>>[];
}

export const ResourceTypeTabsV2 = ({
  currentResourceType = 'all',
  setCurrentResourceType,
  ...rest
}: Props) => {
  return (
    <StyledTabs
      activeKey={currentResourceType}
      onTabClick={(tab) => {
        setCurrentResourceType(tab);
      }}
      {...rest}
    />
  );
};

const StyledTabs = styled(Tabs)`
  .rc-tabs-nav-wrap {
    border-bottom: 1px solid ${Colors['decorative--grayscale--300']};
  }
`;
