import { Menu } from '@cognite/cogs.js';
import styled from 'styled-components/macro';

export const ToolbarMenu = styled(Menu)`
  .cogs-menu-item {
    min-width: 150px;
  }

  label.cogs-switch {
    margin: auto;
    margin-right: 0;
  }

  .switch-ui {
    margin-right: 0;
  }
`;
