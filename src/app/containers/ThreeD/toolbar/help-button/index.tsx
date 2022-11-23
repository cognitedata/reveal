import { Button, Colors, Dropdown, Menu, Tooltip } from '@cognite/cogs.js';
import {
  MouseNavigation,
  KeyboardNavigation,
  TouchNavigation,
} from './sections';
import { ids } from 'cogs-variables';
import styled from 'styled-components';

const HelpButton = (): JSX.Element => {
  return (
    <Dropdown
      appendTo={() => document.getElementsByClassName(ids.styleScope).item(0)!}
      content={
        <StyledMenu>
          <MouseNavigation />
          <TouchNavigation />
          <KeyboardNavigation />
        </StyledMenu>
      }
      placement="right-end"
    >
      <Tooltip content="Help" placement="right">
        <Button icon="Help" type="ghost" aria-label="help-button" />
      </Tooltip>
    </Dropdown>
  );
};

const StyledMenu = styled(Menu)`
  background-color: ${Colors['surface--medium--inverted']};
  border-radius: 4px;
  display: flex;
  flex-direction: row;
  gap: 24px;
  padding: 16px;
  width: fit-content;
`;

export default HelpButton;
