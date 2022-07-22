import { Tabs } from '@cognite/cogs.js';
import styled from 'styled-components';

export const StyledTabs = styled(Tabs)`
  border: 0;
  height: 100%;
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: auto calc(100% - 50px);
  padding-bottom: 0;

  .rc-tabs-content {
    height: 100%;
  }

  .rc-tabs-tabpane {
    height: 100%;
  }
`;
