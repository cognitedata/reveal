import styled from 'styled-components/macro';

import { Menu } from '@cognite/cogs.js';

export const MarkersFilterWrapper = styled.div`
  display: inline-block;
  margin-left: 10px;
  .CheckboxHolder {
    overflow-y: auto;
    max-height: 300px;
  }
`;

export const CustomMenu = styled(Menu)`
  width: fit-content;
  max-height: 670px;
  overflow: auto;

  .cogs-menu-item {
    min-height: 36px;
  }
`;

export const LogsMessageWrapper = styled.div`
  padding-top: 200px;
  padding-bottom: 200px;
`;
