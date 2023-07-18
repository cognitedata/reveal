/*!
 * Copyright 2023 Cognite AS
 */

import { Checkbox, Menu } from '@cognite/cogs.js';
import styled from 'styled-components';

export const StyledCheckbox = styled(Checkbox)`
  margin-left: 10px;
`;

export const StyledMenu = styled(Menu)`
  display: flex;
  flex-direction: row;
  box-shadow: none;
  padding: 0px;
`;

export const StyledSubMenu = styled(Menu)`
  box-shadow: none;
  padding: 8px;
`;

export const StyledSubMenuWrapper = styled(Menu.Section)`
  background-color: #ffffff;
  border-radius: 8px;
  overflow: auto;
`;
