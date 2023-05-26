import styled from 'styled-components';

import { Tabs } from '@cognite/cogs.js';
export const TabContainer = styled.div`
  display: flex;
  align-items: center;
`;

export const ResourceTypeTitle = styled.div`
  margin-right: 8px;
`;

export const CounterTab = styled(Tabs.Tab)`
  span {
    overflow: hidden;
  }
`;
