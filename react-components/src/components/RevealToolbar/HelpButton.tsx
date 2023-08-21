/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement } from 'react';

import { Button, Dropdown } from '@cognite/cogs.js';
import styled from 'styled-components';
import { MouseNavigation } from './Help/MouseNavigation';
import { TouchNavigation } from './Help/TouchNavigation';
import { KeyboardNavigation } from './Help/KeyboardNavigation';

export const HelpButton = (): ReactElement => {
  return (
    <Dropdown
      appendTo={document.body}
      content={
        <StyledMenu>
          <MouseNavigation />
          <KeyboardNavigation />
          <TouchNavigation />
        </StyledMenu>
      }
      placement="right">
      <Button type="ghost" icon="Help" aria-label="help-button" />
    </Dropdown>
  );
};

const StyledMenu = styled.div`
  background-color: #516efa;
  border-radius: 4px;
  display: flex;
  flex-direction: row;
  gap: 24px;
  padding: 16px;
  width: fit-content;
  max-width: fit-content;
`;
