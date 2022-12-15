import React from 'react';
import { Colors, Tabs } from '@cognite/cogs.js';
import styled from 'styled-components/macro';

type Props = {
  currentResourceType?: string;
  setCurrentResourceType: (tab?: string) => void;
  children: React.ReactNode;
};

export const ResourceTypeTabsV2 = ({
  currentResourceType,
  setCurrentResourceType,
  children,
}: Props) => {
  return (
    <StyledTabs
      activeKey={currentResourceType}
      onChange={tab => setCurrentResourceType(tab)}
    >
      {children}
    </StyledTabs>
  );
};

const StyledTabs = styled(Tabs)`
  .rc-tabs-nav-wrap {
    border-bottom: 1px solid ${Colors['greyscale-grey3'].hex()};
  }
`;
