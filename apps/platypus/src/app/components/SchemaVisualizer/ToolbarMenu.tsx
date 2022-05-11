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

  .cogs-switch .switch-ui {
    margin-right: 0;
    width: 28px;
    height: 16px;
  }

  .cogs-switch .switch-ui:after {
    width: 12px;
    height: 12px;
    margin: 2px;
  }

  label.cogs-checkbox {
    margin: auto;
    margin-right: 0;
  }

  label.cogs-checkbox .checkbox-ui {
    margin: 0;
  }
`;
